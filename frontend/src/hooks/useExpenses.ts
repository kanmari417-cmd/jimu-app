import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client';
import type { Expense, ExpenseInput, ExpenseMonthlySummary, ExtractedReceipt } from '../types/expense';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseMonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesData, summaryData] = await Promise.all([
        apiGet<Expense[]>('/expenses'),
        apiGet<ExpenseMonthlySummary[]>('/expenses/summary/monthly'),
      ]);
      setExpenses(expensesData);
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const createExpense = useCallback(
    async (input: ExpenseInput) => {
      await apiPost('/expenses', input);
      await reload();
    },
    [reload],
  );

  const updateExpense = useCallback(
    async (id: number, input: Partial<ExpenseInput>) => {
      await apiPut(`/expenses/${id}`, input);
      await reload();
    },
    [reload],
  );

  const deleteExpense = useCallback(
    async (id: number) => {
      await apiDelete(`/expenses/${id}`);
      await reload();
    },
    [reload],
  );

  const extractReceipt = useCallback(async (image: string) => {
    return apiPost<ExtractedReceipt>('/expenses/extract', { image });
  }, []);

  return { expenses, summary, loading, error, reload, createExpense, updateExpense, deleteExpense, extractReceipt };
}
