export type PaymentStatus = '未確認' | '確認済み' | '要対応';

export interface PaymentRecord {
  id: number;
  date: string; // YYYY-MM-DD
  customer_name: string;
  staff_name: string;
  contract_amount: number;
  confirmed_date: string | null; // YYYY-MM-DD
  received_amount: number | null;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentWithDerived extends PaymentRecord {
  amount_difference: number | null; // received_amount - contract_amount
  is_overdue: boolean; // 未確認のまま3日以上経過
}

export interface PaymentInput {
  date: string;
  customer_name: string;
  staff_name: string;
  contract_amount: number;
  confirmed_date?: string | null;
  received_amount?: number | null;
  status?: PaymentStatus;
  notes?: string | null;
}

export interface MonthlySummaryRow {
  month: string; // YYYY-MM
  total_received: number;
  total_contract: number;
  count: number;
}
