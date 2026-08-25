import dayjs from 'dayjs';
import { db } from '../db/database.js';
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

export function listPayments(filters: ListPaymentsFilters = {}): PaymentWithDerived[] {
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (filters.status) {
    conditions.push('status = @status');
    params.status = filters.status;
  }
  if (filters.month) {
    conditions.push("strftime('%Y-%m', date) = @month");
    params.month = filters.month;
  }

  let query = 'SELECT * FROM payments';
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ' ORDER BY date DESC, id DESC';

  const rows = db.prepare(query).all(params) as PaymentRecord[];
  return rows.map(withDerived);
}

export function getPayment(id: number): PaymentWithDerived | undefined {
  const row = db.prepare('SELECT * FROM payments WHERE id = ?').get(id) as PaymentRecord | undefined;
  return row ? withDerived(row) : undefined;
}

export function createPayment(input: PaymentInput): PaymentWithDerived {
  const stmt = db.prepare(`
    INSERT INTO payments
      (date, customer_name, staff_name, contract_amount, confirmed_date, received_amount, status, notes, updated_at)
    VALUES
      (@date, @customer_name, @staff_name, @contract_amount, @confirmed_date, @received_amount, @status, @notes, datetime('now'))
  `);
  const result = stmt.run({
    date: input.date,
    customer_name: input.customer_name,
    staff_name: input.staff_name,
    contract_amount: input.contract_amount,
    confirmed_date: input.confirmed_date ?? null,
    received_amount: input.received_amount ?? null,
    status: input.status ?? '未確認',
    notes: input.notes ?? null,
  });

  return getPayment(Number(result.lastInsertRowid))!;
}

export function updatePayment(id: number, input: Partial<PaymentInput>): PaymentWithDerived | undefined {
  const existing = db.prepare('SELECT * FROM payments WHERE id = ?').get(id) as PaymentRecord | undefined;
  if (!existing) return undefined;

  const merged: PaymentRecord = { ...existing, ...input } as PaymentRecord;

  db.prepare(`
    UPDATE payments SET
      date = @date,
      customer_name = @customer_name,
      staff_name = @staff_name,
      contract_amount = @contract_amount,
      confirmed_date = @confirmed_date,
      received_amount = @received_amount,
      status = @status,
      notes = @notes,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({ ...merged, id });

  return getPayment(id);
}

export function deletePayment(id: number): boolean {
  const result = db.prepare('DELETE FROM payments WHERE id = ?').run(id);
  return result.changes > 0;
}

/**
 * 月別の着金合計を自動集計する。
 * 着金確認日があればその月、なければ入力日の月に計上し、
 * 未着金分は total_received に含めない(0円扱い)。
 */
export function monthlySummary(): MonthlySummaryRow[] {
  const rows = db
    .prepare(
      `
      SELECT
        strftime('%Y-%m', COALESCE(confirmed_date, date)) AS month,
        SUM(COALESCE(received_amount, 0)) AS total_received,
        SUM(contract_amount) AS total_contract,
        COUNT(*) AS count
      FROM payments
      GROUP BY month
      ORDER BY month DESC
    `,
    )
    .all() as MonthlySummaryRow[];

  return rows;
}
