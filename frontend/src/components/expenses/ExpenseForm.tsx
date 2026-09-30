import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { Expense, ExpenseCategory, ExpenseInput, ExpenseStatus, ExtractedReceipt } from '../../types/expense';
import { compressImageToDataUrl } from '../../utils/image';

const CATEGORIES: ExpenseCategory[] = ['交通費', '接待交際費', '消耗品費', '会議費', 'その他'];
const STATUSES: ExpenseStatus[] = ['下書き', '申請中', '承認済み', '却下'];

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
  initial?: Expense;
  onSubmit: (input: ExpenseInput) => Promise<void>;
  onExtractReceipt: (image: string) => Promise<ExtractedReceipt>;
  onCancel: () => void;
};

export default function ExpenseForm({ initial, onSubmit, onExtractReceipt, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? '交通費');
  const [staffName, setStaffName] = useState(initial?.staff_name ?? '');
  const [vendor, setVendor] = useState(initial?.vendor ?? '');
  const [amount, setAmount] = useState(initial?.amount !== undefined ? String(initial.amount) : '');
  const [status, setStatus] = useState<ExpenseStatus>(initial?.status ?? '下書き');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [receiptImage, setReceiptImage] = useState<string | null>(initial?.receipt_image ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setExtractError(null);
    setAutoFilled(false);

    let dataUrl: string;
    try {
      dataUrl = await compressImageToDataUrl(file);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : '画像の読み込みに失敗しました');
      return;
    }
    setReceiptImage(dataUrl);

    setExtracting(true);
    try {
      const extracted = await onExtractReceipt(dataUrl);
      if (extracted.date) setDate(extracted.date);
      if (extracted.vendor) setVendor(extracted.vendor);
      if (extracted.amount) setAmount(String(extracted.amount));
      if (extracted.category) setCategory(extracted.category);
      if (extracted.notes) setNotes((prev) => (prev ? prev : extracted.notes ?? ''));
      setAutoFilled(true);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : '自動読み取りに失敗しました。手動で入力してください。');
    } finally {
      setExtracting(false);
    }
  }

  function removeReceiptImage() {
    setReceiptImage(null);
    setAutoFilled(false);
    setExtractError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const amountNum = Number(amount);
    if (!date || !staffName.trim() || !vendor.trim() || amount === '' || Number.isNaN(amountNum)) {
      setError('日付・申請者・支払先・金額は必須です');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        date,
        category,
        staff_name: staffName.trim(),
        vendor: vendor.trim(),
        amount: amountNum,
        receipt_image: receiptImage,
        notes: notes.trim() || null,
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

      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">領収書の写真</span>
        <p className="mb-2 text-xs text-gray-500">
          写真を追加すると、AIが日付・支払先・金額・カテゴリを自動で読み取ってフォームに入力します(手書きの領収書にも対応)。内容は保存前に必ずご確認ください。
        </p>

        {receiptImage ? (
          <div className="flex items-start gap-3">
            <img
              src={receiptImage}
              alt="領収書プレビュー"
              className="h-28 w-28 rounded-md border border-gray-200 object-cover"
            />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                差し替える
              </button>
              <button
                type="button"
                onClick={removeReceiptImage}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                削除
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-md border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
          >
            + 領収書の写真を追加(カメラ撮影 / ファイル選択)
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {extracting && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            AIが読み取り中…
          </p>
        )}
        {!extracting && autoFilled && (
          <p className="mt-2 text-xs text-green-700">✓ AIが自動入力しました。内容を確認してください。</p>
        )}
        {!extracting && extractError && <p className="mt-2 text-xs text-red-600">{extractError}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="日付" required>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClass} />
        </Field>
        <Field label="カテゴリ" required>
          <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className={inputClass}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="申請者" required>
          <input value={staffName} onChange={(e) => setStaffName(e.target.value)} required className={inputClass} />
        </Field>
        <Field label="支払先" required>
          <input value={vendor} onChange={(e) => setVendor(e.target.value)} required className={inputClass} />
        </Field>
        <Field label="金額(円)" required>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="ステータス">
          <select value={status} onChange={(e) => setStatus(e.target.value as ExpenseStatus)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="備考">
        <textarea value={notes ?? ''} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
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
          disabled={submitting || extracting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? '保存中…' : '保存'}
        </button>
      </div>
    </form>
  );
}
