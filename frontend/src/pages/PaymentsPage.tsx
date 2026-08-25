import ApiStatus from '../components/common/ApiStatus';

export default function PaymentsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">① 着金入力管理</h2>
        <ApiStatus />
      </div>
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
        次のステップでこの画面に着金入力フォーム・一覧・アラート機能を実装します。
      </div>
    </div>
  );
}
