import { useState, type DragEvent } from 'react';
import type { Task, TaskStatus } from '../../types/task';
import TaskCard from './TaskCard';

const STATUS_HEADER_STYLE: Record<TaskStatus, string> = {
  提出待ち: 'bg-gray-100 text-gray-700',
  確認中: 'bg-blue-100 text-blue-700',
  完了: 'bg-green-100 text-green-700',
};

type Props = {
  status: TaskStatus;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onDragStart: (e: DragEvent<HTMLDivElement>, task: Task) => void;
  onDropStatus: (status: TaskStatus) => void;
};

export default function KanbanColumn({ status, tasks, onEdit, onDelete, onDragStart, onDropStatus }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        onDropStatus(status);
      }}
      className={`flex min-h-[200px] flex-1 flex-col gap-2 rounded-lg border-2 border-dashed p-3 transition-colors ${
        isDragOver ? 'border-blue-400 bg-blue-50' : 'border-transparent bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_HEADER_STYLE[status]}`}>
          {status}
        </span>
        <span className="text-xs text-gray-500">{tasks.length}件</span>
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 bg-white py-6 text-center text-xs text-gray-400">
          カードをここにドラッグ
        </p>
      ) : (
        tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} onDragStart={onDragStart} />
        ))
      )}
    </div>
  );
}
