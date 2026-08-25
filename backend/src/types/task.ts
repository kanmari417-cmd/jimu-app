export type TaskStatus = '提出待ち' | '確認中' | '完了';

export interface TaskRecord {
  id: number;
  target_name: string;
  type: string;
  staff_name: string;
  due_date: string; // YYYY-MM-DD
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskWithDerived extends TaskRecord {
  is_overdue: boolean; // 期限超過(完了以外かつ期限を過ぎている)
}

export interface TaskInput {
  target_name: string;
  type: string;
  staff_name: string;
  due_date: string;
  status?: TaskStatus;
}
