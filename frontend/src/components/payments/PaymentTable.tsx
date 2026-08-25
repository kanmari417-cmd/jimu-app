import type { Payment } from '../../types/payment';

const STATUS_STYLE: Record<Payment['status'], string> = {
  未確認: 'bg-gray-100 text-gray-700',
  確認済み: 'bg-green-100 text-green-700',
  要対応: 'bg-red-100 text-red-700',
};

const thClass = 'px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap';
const tdClass = 'px-3 py-2 whitespace-nowrap text-gray-700';

function formatYen(amount: number | null) {
  if (amount === null || amount === undefined) return '—';
  return `¥${amount.toLocaleString('ja-JP')}`;
}

type Props = {
  payments: Payment[];
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
};

export default function PaymentTable({ payments, onEdit, onDelete }: Props) {
  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
        該当する着金データがありません。
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className={thClass}>日付</th>
            <th className={thClass}>顧客名</th>
            <th className={thClass}>担当者</th>
            <th className={thClass}>契約金額</th>
            <th className={thClass}>着金確認日</th>
            <th className={thClass}>着金金額</th>
            <th className={thClass}>差異</th>
            <th className={thClass}>ステータス</th>
            <th className={thClass}>備考</th>
            <th className={thClass} />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payments.map((p) => {
            const hasDiff = p.amount_difference !== null && p.amount_difference !== 0;
            return (
              <tr key={p.id} className={p.is_overdue ? 'bg-red-50' : undefined}>
                <td className={tdClass}>
                  <div className="flex items-center gap-2">
                    <span>{p.date}</span>
                    {p.is_overdue && (
                      <span className="inline-block rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
                        未確認3日超過
                      </span>
                    )}
                  </div>
                </td>
                <td className={tdClass}>{p.customer_name}</td>
                <td className={tdClass}>{p.staff_name}</td>
                <td className={tdClass}>{formatYen(p.contract_amount)}</td>
                <td className={tdClass}>{p.confirmed_date ?? '—'}</td>
                <td className={tdClass}>{formatYen(p.received_amount)}</td>
                <td className={`${tdClass} ${hasDiff ? 'font-semibold text-orange-600' : 'text-gray-400'}`}>
                  {p.amount_difference === null
                    ? '—'
                    : `${p.amount_difference > 0 ? '+' : ''}${p.amount_difference.toLocaleString('ja-JP')}`}
                </td>
                <td className={tdClass}>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className={`${tdClass} max-w-[160px] truncate`} title={p.notes ?? ''}>
                  {p.notes ?? '—'}
                </td>
                <td className={tdClass}>
                  <div className="flex gap-3">
                    <button onClick={() => onEdit(p)} className="text-blue-600 hover:underline">
                      編集
                    </button>
                    <button onClick={() => onDelete(p)} className="text-red-600 hover:underline">
                      削除
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
