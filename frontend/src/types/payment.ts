export type PaymentStatus = '未確認' | '確認済み' | '要対応';

export interface Payment {
  id: number;
  date: string; // YYYY-MM-DD
  customer_name: string;
  staff_name: string;
  contract_amount: number;
  confirmed_date: string | null;
  received_amount: number | null;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  amount_difference: number | null;
  is_overdue: boolean;
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

export interface MonthlySummary {
  month: string; // YYYY-MM
  total_received: number;
  total_contract: number;
  count: number;
}
