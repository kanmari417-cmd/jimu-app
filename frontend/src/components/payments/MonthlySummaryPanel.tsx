import type { MonthlySummary } from '../../types/payment';

export default function MonthlySummaryPanel({ summary }: { summary: MonthlySummary[] }) {
  if (summary.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">月別 着金合計</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.month} className="rounded-md bg-gray-50 p-3">
            <p className="text-xs text-gray-500">{s.month}</p>
            <p className="text-base font-semibold text-gray-900">¥{s.total_received.toLocaleString('ja-JP')}</p>
            <p className="text-xs text-gray-400">
              契約 ¥{s.total_contract.toLocaleString('ja-JP')} / {s.count}件
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
