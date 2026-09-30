export type ExpenseCategory = '交通費' | '接待交際費' | '消耗品費' | '会議費' | 'その他';
export type ExpenseStatus = '下書き' | '申請中' | '承認済み' | '却下';

export interface ExpenseRecord {
  id: number;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  staff_name: string;
  vendor: string;
  amount: number;
  receipt_image: string | null; // data URL (base64)
  notes: string | null;
  status: ExpenseStatus;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInput {
  date: string;
  category: ExpenseCategory;
  staff_name: string;
  vendor: string;
  amount: number;
  receipt_image?: string | null;
  notes?: string | null;
  status?: ExpenseStatus;
}

export interface ExpenseMonthlySummaryRow {
  month: string; // YYYY-MM
  total_amount: number;
  approved_amount: number;
  count: number;
}

export interface ExtractedReceipt {
  date: string | null;
  vendor: string | null;
  amount: number | null;
  category: ExpenseCategory | null;
  notes: string | null;
}
