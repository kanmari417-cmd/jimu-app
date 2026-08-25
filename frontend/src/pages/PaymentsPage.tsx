import { useMemo, useState } from 'react';
import ApiStatus from '../components/common/ApiStatus';
import Modal from '../components/common/Modal';
import MonthlySummaryPanel from '../components/payments/MonthlySummaryPanel';
import PaymentForm from '../components/payments/PaymentForm';
import PaymentTable from '../components/payments/PaymentTable';
import { usePayments } from '../hooks/usePayments';
import type { Payment, PaymentInput, PaymentStatus } from '../types/payment';

const STATUS_FILTERS: Array<PaymentStatus | 'all'> = ['all', '未確認', '確認済み', '要対応'];

export default function PaymentsPage() {
  const { payments, summary, loading, error, createPayment, updatePayment, deletePayment } = usePayments();
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | undefined>(undefined);

  const filteredPayments = useMemo(
    () => (statusFilter === 'all' ? payments : payments.filter((p) => p.status === statusFilter)),
    [payments, statusFilter],
  );

  const overduePayments = useMemo(() => payments.filter((p) => p.is_overdue), [payments]);

  function openCreateForm() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEditForm(payment: Payment) {
    setEditing(payment);
    setFormOpen(true);
  }

  async function handleSubmit(input: PaymentInput) {
    if (editing) {
      await updatePayment(editing.id, input);
    } else {
      await createPayment(input);
    }
    setFormOpen(false);
  }

  async function handleDelete(payment: Payment) {
    if (!window.confirm(`${payment.customer_name} の着金データを削除しますか?`)) return;
    await deletePayment(payment.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">① 着金入力管理</h2>
        <div className="flex items-center gap-2">
          <ApiStatus />
          <button
            onClick={openCreateForm}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + 新規登録
          </button>
        </div>
      </div>

      {overduePayments.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ 未確認のまま3日以上経過しているデータが {overduePayments.length} 件あります(
          {overduePayments.map((p) => p.customer_name).join('、')})
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <MonthlySummaryPanel summary={summary} />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'すべて' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">読み込み中…</p>
      ) : (
        <PaymentTable payments={filteredPayments} onEdit={openEditForm} onDelete={handleDelete} />
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? '着金データを編集' : '着金データを新規登録'}
      >
        <PaymentForm initial={editing} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}
