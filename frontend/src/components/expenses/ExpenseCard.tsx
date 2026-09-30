import { useState } from 'react';
import Modal from '../common/Modal';
import type { Expense } from '../../types/expense';

const CATEGORY_STYLE: Record<Expense['category'], string> = {
  交通費: 'bg-blue-100 text-blue-700',
  接待交際費: 'bg-purple-100 text-purple-700',
  消耗品費: 'bg-amber-100 text-amber-700',
  会議費: 'bg-teal-100 text-teal-700',
  その他: 'bg-gray-100 text-gray-700',
};

const STATUS_STYLE: Record<Expense['status'], string> = {
  下書き: 'bg-gray-100 text-gray-600',
  申請中: 'bg-blue-100 text-blue-700',
  承認済み: 'bg-green-100 text-green-700',
  却下: 'bg-red-100 text-red-700',
};

function formatYen(amount: number) {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

type Props = {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
};

export default function ExpenseCard({ expense, onEdit, onDelete }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      {expense.receipt_image ? (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200"
        >
          <img src={expense.receipt_image} alt="領収書" className="h-full w-full object-cover" />
        </button>
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-gray-300 text-xs text-gray-400">
          写真なし
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLE[expense.category]}`}>
            {expense.category}
          </span>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[expense.status]}`}>
            {expense.status}
          </span>
        </div>
        <p className="truncate text-sm font-semibold text-gray-900">{expense.vendor}</p>
        <p className="text-base font-semibold text-gray-900">{formatYen(expense.amount)}</p>
        <p className="text-xs text-gray-500">
          {expense.date} ・ {expense.staff_name}
        </p>
        {expense.notes && <p className="mt-1 truncate text-xs text-gray-400" title={expense.notes}>{expense.notes}</p>}

        <div className="mt-2 flex gap-3 text-xs">
          <button onClick={() => onEdit(expense)} className="text-blue-600 hover:underline">
            編集
          </button>
          <button onClick={() => onDelete(expense)} className="text-red-600 hover:underline">
            削除
          </button>
        </div>
      </div>

      {expense.receipt_image && (
        <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)} title={`領収書 - ${expense.vendor}`}>
          <img src={expense.receipt_image} alt="領収書拡大表示" className="w-full rounded-md" />
        </Modal>
      )}
    </div>
  );
}
