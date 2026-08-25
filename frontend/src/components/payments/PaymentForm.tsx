import { useState, type FormEvent, type ReactNode } from 'react';
import type { Payment, PaymentInput, PaymentStatus } from '../../types/payment';

const STATUSES: PaymentStatus[] = ['未確認', '確認済み', '要対応'];

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
  initial?: Payment;
  onSubmit: (input: PaymentInput) => Promise<void>;
  onCancel: () => void;
};

export default function PaymentForm({ initial, onSubmit, onCancel }: Props) {
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState(initial?.customer_name ?? '');
  const [staffName, setStaffName] = useState(initial?.staff_name ?? '');
  const [contractAmount, setContractAmount] = useState(
    initial?.contract_amount !== undefined ? String(initial.contract_amount) : '',
  );
  const [confirmedDate, setConfirmedDate] = useState(initial?.confirmed_date ?? '');
  const [receivedAmount, setReceivedAmount] = useState(
    initial?.received_amount !== null && initial?.received_amount !== undefined
      ? String(initial.received_amount)
      : '',
  );
  const [status, setStatus] = useState<PaymentStatus>(initial?.status ?? '未確認');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const contractAmountNum = Number(contractAmount);
    if (!date || !customerName.trim() || !staffName.trim() || contractAmount === '' || Number.isNaN(contractAmountNum)) {
      setError('日付・顧客名・担当者名・契約金額は必須です');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        date,
        customer_name: customerName.trim(),
        staff_name: staffName.trim(),
        contract_amount: contractAmountNum,
        confirmed_date: confirmedDate || null,
        received_amount: receivedAmount === '' ? null : Number(receivedAmount),
        status,
        notes: notes.trim() || null,
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
        <Field label="日付" required>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="ステータス">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PaymentStatus)}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="顧客名" required>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="担当者名" required>
          <input
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="契約金額(円)" required>
          <input
            type="number"
            min="0"
            value={contractAmount}
            onChange={(e) => setContractAmount(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="着金金額(円)">
          <input
            type="number"
            min="0"
            value={receivedAmount}
            onChange={(e) => setReceivedAmount(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="着金確認日">
          <input
            type="date"
            value={confirmedDate ?? ''}
            onChange={(e) => setConfirmedDate(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="備考">
        <textarea
          value={notes ?? ''}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputClass}
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
