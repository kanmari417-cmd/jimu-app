import { useState, type FormEvent, type ReactNode } from 'react';
import type { Template, TemplateCategory, TemplateInput } from '../../types/template';

const CATEGORIES: TemplateCategory[] = ['採用事務', 'Slack投稿', '顧客対応'];

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
  initial?: Template;
  defaultCategory?: TemplateCategory;
  onSubmit: (input: TemplateInput) => Promise<void>;
  onCancel: () => void;
};

export default function TemplateForm({ initial, defaultCategory, onSubmit, onCancel }: Props) {
  const [category, setCategory] = useState<TemplateCategory>(initial?.category ?? defaultCategory ?? '採用事務');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !body.trim()) {
      setError('タイトル・本文は必須です');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ category, title: title.trim(), body });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Field label="カテゴリ" required>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TemplateCategory)}
          className={inputClass}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="タイトル" required>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} />
      </Field>

      <Field label="本文" required>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={8}
          className={`${inputClass} font-mono`}
        />
      </Field>

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
