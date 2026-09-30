import { sql } from '../db/postgres.js';
import type { ExpenseInput, ExpenseMonthlySummaryRow, ExpenseRecord } from '../types/expense.js';

export interface ListExpensesFilters {
  status?: string;
  month?: string; // YYYY-MM
}

export async function listExpenses(filters: ListExpensesFilters = {}): Promise<ExpenseRecord[]> {
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

  let query = 'SELECT * FROM expenses';
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }
  query += ' ORDER BY date DESC, id DESC';

  const { rows } = await sql.query<ExpenseRecord>(query, params);
  return rows;
}

export async function getExpense(id: number): Promise<ExpenseRecord | undefined> {
  const { rows } = await sql.query<ExpenseRecord>('SELECT * FROM expenses WHERE id = $1', [id]);
  return rows[0];
}

export async function createExpense(input: ExpenseInput): Promise<ExpenseRecord> {
  const { rows } = await sql.query<ExpenseRecord>(
    `INSERT INTO expenses (date, category, staff_name, vendor, amount, receipt_image, notes, status, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     RETURNING *`,
    [
      input.date,
      input.category,
      input.staff_name,
      input.vendor,
      input.amount,
      input.receipt_image ?? null,
      input.notes ?? null,
      input.status ?? '下書き',
    ],
  );
  return rows[0];
}

export async function updateExpense(id: number, input: Partial<ExpenseInput>): Promise<ExpenseRecord | undefined> {
  const existing = await getExpense(id);
  if (!existing) return undefined;

  const merged: ExpenseRecord = { ...existing, ...input } as ExpenseRecord;

  const { rows } = await sql.query<ExpenseRecord>(
    `UPDATE expenses SET
      date = $1, category = $2, staff_name = $3, vendor = $4, amount = $5,
      receipt_image = $6, notes = $7, status = $8, updated_at = NOW()
     WHERE id = $9
     RETURNING *`,
    [
      merged.date,
      merged.category,
      merged.staff_name,
      merged.vendor,
      merged.amount,
      merged.receipt_image,
      merged.notes,
      merged.status,
      id,
    ],
  );
  return rows[0];
}

export async function deleteExpense(id: number): Promise<boolean> {
  const { rowCount } = await sql.query('DELETE FROM expenses WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}

/**
 * 月別の経費合計を自動集計する。
 * total_amount は全件の合計、approved_amount は承認済みのみの合計。
 */
export async function monthlySummary(): Promise<ExpenseMonthlySummaryRow[]> {
  const { rows } = await sql.query<{
    month: string;
    total_amount: string;
    approved_amount: string;
    count: string;
  }>(`
    SELECT
      SUBSTRING(date, 1, 7) AS month,
      SUM(amount) AS total_amount,
      SUM(CASE WHEN status = '承認済み' THEN amount ELSE 0 END) AS approved_amount,
      COUNT(*) AS count
    FROM expenses
    GROUP BY month
    ORDER BY month DESC
  `);

  return rows.map((r) => ({
    month: r.month,
    total_amount: Number(r.total_amount),
    approved_amount: Number(r.approved_amount),
    count: Number(r.count),
  }));
}
