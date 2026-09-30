import { useMemo, useState } from 'react';
import Banner from '../components/common/Banner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
import ExpenseCard from '../components/expenses/ExpenseCard';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseMonthlySummaryPanel from '../components/expenses/ExpenseMonthlySummaryPanel';
import { useExpenses } from '../hooks/useExpenses';
import type { Expense, ExpenseInput, ExpenseStatus } from '../types/expense';

const STATUS_FILTERS: Array<ExpenseStatus | 'all'> = ['all', '下書き', '申請中', '承認済み', '却下'];

export default function ExpensesPage() {
  const { expenses, summary, loading, error, createExpense, updateExpense, deleteExpense, extractReceipt } =
    useExpenses();
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>(undefined);

  const filteredExpenses = useMemo(
    () => (statusFilter === 'all' ? expenses : expenses.filter((e) => e.status === statusFilter)),
    [expenses, statusFilter],
  );

  function openCreateForm() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEditForm(expense: Expense) {
    setEditing(expense);
    setFormOpen(true);
  }

  async function handleSubmit(input: ExpenseInput) {
    if (editing) {
      await updateExpense(editing.id, input);
    } else {
      await createExpense(input);
    }
    setFormOpen(false);
  }

  async function handleDelete(expense: Expense) {
    if (!window.confirm(`${expense.vendor}(¥${expense.amount.toLocaleString('ja-JP')})の経費データを削除しますか?`))
      return;
    await deleteExpense(expense.id);
  }

  return (
    <div className="space-y-4">
      <PageHeader title="⑤ 経費精算">
        <button
          onClick={openCreateForm}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 新規登録
        </button>
      </PageHeader>

      {error && <Banner tone="error">{error}</Banner>}

      <ExpenseMonthlySummaryPanel summary={summary} />

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
      ) : filteredExpenses.length === 0 ? (
        <EmptyState>該当する経費データがありません。</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredExpenses.map((e) => (
            <ExpenseCard key={e.id} expense={e} onEdit={openEditForm} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? '経費データを編集' : '経費データを新規登録'}
      >
        <ExpenseForm
          initial={editing}
          onSubmit={handleSubmit}
          onExtractReceipt={extractReceipt}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>
    </div>
  );
}
