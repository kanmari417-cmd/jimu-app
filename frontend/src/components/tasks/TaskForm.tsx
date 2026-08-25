import { useState, type FormEvent, type ReactNode } from 'react';
import type { Task, TaskInput, TaskStatus } from '../../types/task';

const STATUSES: TaskStatus[] = ['提出待ち', '確認中', '完了'];

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

type Props = {
  initial?: Task;
  onSubmit: (input: TaskInput) => Promise<void>;
  onCancel: () => void;
};

export default function TaskForm({ initial, onSubmit, onCancel }: Props) {
  const [targetName, setTargetName] = useState(initial?.target_name ?? '');
  const [type, setType] = useState(initial?.type ?? '');
  const [staffName, setStaffName] = useState(initial?.staff_name ?? '');
  const [dueDate, setDueDate] = useState(initial?.due_date ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? '提出待ち');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!targetName.trim() || !type.trim() || !staffName.trim() || !dueDate) {
      setError('対象者名・種別・担当者・期限は必須です');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        target_name: targetName.trim(),
        type: type.trim(),
        staff_name: staffName.trim(),
        due_date: dueDate,
        status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="対象者名" required>
          <input value={targetName} onChange={(e) => setTargetName(e.target.value)} required className={inputClass} />
        </Field>
        <Field label="種別" required>
          <input
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            placeholder="例: 契約書 / 身元保証書"
            className={inputClass}
          />
        </Field>
        <Field label="担当者" required>
          <input value={staffName} onChange={(e) => setStaffName(e.target.value)} required className={inputClass} />
        </Field>
        <Field label="期限" required>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="ステータス">
          <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? '保存中…' : '保存'}
        </button>
      </div>
    </form>
  );
}
