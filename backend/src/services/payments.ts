import dayjs from 'dayjs';
import { sql } from '../db/postgres.js';
import type {
  MonthlySummaryRow,
  PaymentInput,
  PaymentRecord,
  PaymentWithDerived,
} from '../types/payment.js';

const OVERDUE_THRESHOLD_DAYS = 3;

function withDerived(row: PaymentRecord): PaymentWithDerived {
  const amount_difference =
    row.received_amount === null || row.received_amount === undefined
      ? null
      : row.received_amount - row.contract_amount;

  const is_overdue =
    row.status === '未確認' && dayjs().startOf('day').diff(dayjs(row.date), 'day') >= OVERDUE_THRESHOLD_DAYS;

  return { ...row, amount_difference, is_overdue };
}

export interface ListPaymentsFilters {
  status?: string;
  month?: string; // YYYY-MM
}

export async function listPayments(filters: ListPaymentsFilters = {}): Promise<PaymentWithDerived[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filters.month) {
    params.push(`${filters.month}-%`);
    conditions.push(`date LIKE $${params.length}`);
  }

  let query = 'SELECT * FROM payments';
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ' ORDER BY date DESC, id DESC';

  const { rows } = await sql.query<PaymentRecord>(query, params);
  return rows.map(withDerived);
}

async function fetchRawPayment(id: number): Promise<PaymentRecord | undefined> {
  const { rows } = await sql.query<PaymentRecord>('SELECT * FROM payments WHERE id = $1', [id]);
  return rows[0];
}

export async function getPayment(id: number): Promise<PaymentWithDerived | undefined> {
  const row = await fetchRawPayment(id);
  return row ? withDerived(row) : undefined;
}

export async function createPayment(input: PaymentInput): Promise<PaymentWithDerived> {
  const { rows } = await sql.query<PaymentRecord>(
    `INSERT INTO payments
      (date, customer_name, staff_name, contract_amount, confirmed_date, received_amount, status, notes, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING *`,
    [
      input.date,
      input.customer_name,
      input.staff_name,
      input.contract_amount,
      input.confirmed_date ?? null,
      input.received_amount ?? null,
      input.status ?? '未確認',
      input.notes ?? null,
    ],
  );
  return withDerived(rows[0]);
}

export async function updatePayment(id: number, input: Partial<PaymentInput>): Promise<PaymentWithDerived | undefined> {
  const existing = await fetchRawPayment(id);
  if (!existing) return undefined;

  const merged: PaymentRecord = { ...existing, ...input } as PaymentRecord;

  const { rows } = await sql.query<PaymentRecord>(
    `UPDATE payments SET
      date = $1, customer_name = $2, staff_name = $3, contract_amount = $4,
      confirmed_date = $5, received_amount = $6, status = $7, notes = $8, updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [
      merged.date,
      merged.customer_name,
      merged.staff_name,
      merged.contract_amount,
      merged.confirmed_date,
      merged.received_amount,
      merged.status,
      merged.notes,
      id,
    ],
  );
  return withDerived(rows[0]);
}

export async function deletePayment(id: number): Promise<boolean> {
  const { rowCount } = await sql.query('DELETE FROM payments WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

/**
 * 月別の着金合計を自動集計する。
 * 着金確認日があればその月、なければ入力日の月に計上し、
 * 未着金分は total_received に含めない(0円扱い)。
 */
export async function monthlySummary(): Promise<MonthlySummaryRow[]> {
  const { rows } = await sql.query<{
    month: string;
    total_received: string; // SUM/COUNT はPostgresではnumeric/bigint(文字列)で返る
    total_contract: string;
    count: string;
  }>(`
    SELECT
      SUBSTRING(COALESCE(confirmed_date, date), 1, 7) AS month,
      SUM(COALESCE(received_amount, 0)) AS total_received,
      SUM(contract_amount) AS total_contract,
      COUNT(*) AS count
    FROM payments
    GROUP BY month
    ORDER BY month DESC
  `);

  return rows.map((r) => ({
    month: r.month,
    total_received: Number(r.total_received),
    total_contract: Number(r.total_contract),
    count: Number(r.count),
  }));
}
