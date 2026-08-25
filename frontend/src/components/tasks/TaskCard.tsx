import type { DragEvent } from 'react';
import type { Task } from '../../types/task';

type Props = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, task: Task) => void;
};

export default function TaskCard({ task, onEdit, onDelete, onDragStart }: Props) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className={`cursor-grab rounded-lg border bg-white p-3 shadow-sm active:cursor-grabbing ${
        task.is_overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900">{task.target_name}</p>
        {task.is_overdue && (
          <span className="inline-block shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
            期限超過
          </span>
        )}
      </div>
      <p className="mb-2 text-xs text-gray-500">{task.type}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>担当: {task.staff_name}</span>
        <span className={task.is_overdue ? 'font-semibold text-red-600' : ''}>期限: {task.due_date}</span>
      </div>
      <div className="mt-2 flex justify-end gap-3 text-xs">
        <button onClick={() => onEdit(task)} className="text-blue-600 hover:underline">
          編集
        </button>
        <button onClick={() => onDelete(task)} className="text-red-600 hover:underline">
          削除
        </button>
      </div>
    </div>
  );
}
