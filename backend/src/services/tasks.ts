import dayjs from 'dayjs';
import { db } from '../db/database.js';
import type { TaskInput, TaskRecord, TaskWithDerived } from '../types/task.js';

function withDerived(row: TaskRecord): TaskWithDerived {
  const is_overdue = row.status !== '完了' && dayjs().startOf('day').isAfter(dayjs(row.due_date), 'day');
  return { ...row, is_overdue };
}

export function listTasks(): TaskWithDerived[] {
  const rows = db.prepare('SELECT * FROM tasks ORDER BY due_date ASC, id ASC').all() as TaskRecord[];
  return rows.map(withDerived);
}

export function getTask(id: number): TaskWithDerived | undefined {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRecord | undefined;
  return row ? withDerived(row) : undefined;
}

export function createTask(input: TaskInput): TaskWithDerived {
  const stmt = db.prepare(`
    INSERT INTO tasks (target_name, type, staff_name, due_date, status, updated_at)
    VALUES (@target_name, @type, @staff_name, @due_date, @status, datetime('now'))
  `);
  const result = stmt.run({
    target_name: input.target_name,
    type: input.type,
    staff_name: input.staff_name,
    due_date: input.due_date,
    status: input.status ?? '提出待ち',
  });
  return getTask(Number(result.lastInsertRowid))!;
}

export function updateTask(id: number, input: Partial<TaskInput>): TaskWithDerived | undefined {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRecord | undefined;
  if (!existing) return undefined;

  const merged: TaskRecord = { ...existing, ...input } as TaskRecord;

  db.prepare(`
    UPDATE tasks SET
      target_name = @target_name,
      type = @type,
      staff_name = @staff_name,
      due_date = @due_date,
      status = @status,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({ ...merged, id });

  return getTask(id);
}

export function deleteTask(id: number): boolean {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}
