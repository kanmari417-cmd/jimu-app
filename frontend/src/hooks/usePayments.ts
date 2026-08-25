import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client';
import type { MonthlySummary, Payment, PaymentInput } from '../types/payment';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsData, summaryData] = await Promise.all([
        apiGet<Payment[]>('/payments'),
        apiGet<MonthlySummary[]>('/payments/summary/monthly'),
      ]);
      setPayments(paymentsData);
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

  const createPayment = useCallback(
    async (input: PaymentInput) => {
      await apiPost('/payments', input);
      await reload();
    },
    [reload],
  );

  const updatePayment = useCallback(
    async (id: number, input: Partial<PaymentInput>) => {
      await apiPut(`/payments/${id}`, input);
      await reload();
    },
    [reload],
  );

  const deletePayment = useCallback(
    async (id: number) => {
      await apiDelete(`/payments/${id}`);
      await reload();
    },
    [reload],
  );

  return { payments, summary, loading, error, reload, createPayment, updatePayment, deletePayment };
}
