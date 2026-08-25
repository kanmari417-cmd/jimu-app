export type TaskStatus = '提出待ち' | '確認中' | '完了';

export interface Task {
  id: number;
  target_name: string;
  type: string;
  staff_name: string;
  due_date: string; // YYYY-MM-DD
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  is_overdue: boolean;
}

export interface TaskInput {
  target_name: string;
  type: string;
  staff_name: string;
  due_date: string;
  status?: TaskStatus;
}
