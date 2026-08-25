import dayjs from 'dayjs';
import { sql } from '../db/postgres.js';
import type { TaskInput, TaskRecord, TaskWithDerived } from '../types/task.js';

function withDerived(row: TaskRecord): TaskWithDerived {
  const is_overdue = row.status !== '完了' && dayjs().startOf('day').isAfter(dayjs(row.due_date), 'day');
  return { ...row, is_overdue };
}

export async function listTasks(): Promise<TaskWithDerived[]> {
  const { rows } = await sql.query<TaskRecord>('SELECT * FROM tasks ORDER BY due_date ASC, id ASC');
  return rows.map(withDerived);
}

async function fetchRawTask(id: number): Promise<TaskRecord | undefined> {
  const { rows } = await sql.query<TaskRecord>('SELECT * FROM tasks WHERE id = $1', [id]);
  return rows[0];
}

export async function getTask(id: number): Promise<TaskWithDerived | undefined> {
  const row = await fetchRawTask(id);
  return row ? withDerived(row) : undefined;
}

export async function createTask(input: TaskInput): Promise<TaskWithDerived> {
  const { rows } = await sql.query<TaskRecord>(
    `INSERT INTO tasks (target_name, type, staff_name, due_date, status, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING *`,
    [input.target_name, input.type, input.staff_name, input.due_date, input.status ?? '提出待ち'],
  );
  return withDerived(rows[0]);
}

export async function updateTask(id: number, input: Partial<TaskInput>): Promise<TaskWithDerived | undefined> {
  const existing = await fetchRawTask(id);
  if (!existing) return undefined;

  const merged: TaskRecord = { ...existing, ...input } as TaskRecord;

  const { rows } = await sql.query<TaskRecord>(
    `UPDATE tasks SET target_name = $1, type = $2, staff_name = $3, due_date = $4, status = $5, updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [merged.target_name, merged.type, merged.staff_name, merged.due_date, merged.status, id],
  );
  return withDerived(rows[0]);
}

export async function deleteTask(id: number): Promise<boolean> {
  const { rowCount } = await sql.query('DELETE FROM tasks WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
