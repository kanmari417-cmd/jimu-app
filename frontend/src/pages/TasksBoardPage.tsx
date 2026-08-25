import { useMemo, useState, type DragEvent } from 'react';
import Modal from '../components/common/Modal';
import KanbanColumn from '../components/tasks/KanbanColumn';
import TaskForm from '../components/tasks/TaskForm';
import { useTasks } from '../hooks/useTasks';
import type { Task, TaskInput, TaskStatus } from '../types/task';

const STATUSES: TaskStatus[] = ['提出待ち', '確認中', '完了'];

export default function TasksBoardPage() {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | undefined>(undefined);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  const overdueTasks = useMemo(() => tasks.filter((t) => t.is_overdue), [tasks]);

  function tasksByStatus(status: TaskStatus) {
    return tasks.filter((t) => t.status === status);
  }

  function openCreateForm() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEditForm(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  async function handleSubmit(input: TaskInput) {
    if (editing) {
      await updateTask(editing.id, input);
    } else {
      await createTask(input);
    }
    setFormOpen(false);
  }

  async function handleDelete(task: Task) {
    if (!window.confirm(`${task.target_name} のタスクを削除しますか?`)) return;
    await deleteTask(task.id);
  }

  function handleDragStart(e: DragEvent<HTMLDivElement>, task: Task) {
    setDraggedTaskId(task.id);
    e.dataTransfer.effectAllowed = 'move';
  }

  async function handleDropStatus(status: TaskStatus) {
    const task = tasks.find((t) => t.id === draggedTaskId);
    setDraggedTaskId(null);
    if (!task || task.status === status) return;
    await updateTask(task.id, { status });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">② 未提出チェック管理ボード</h2>
        <button
          onClick={openCreateForm}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 新規登録
        </button>
      </div>

      {overdueTasks.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ 期限を超過しているタスクが {overdueTasks.length} 件あります(
          {overdueTasks.map((t) => t.target_name).join('、')})
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <p className="text-xs text-gray-400">
        カードをドラッグ&ドロップで列間移動できます(スマホでは「編集」からステータスを変更してください)。
      </p>

      {loading ? (
        <p className="text-sm text-gray-500">読み込み中…</p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus(status)}
              onEdit={openEditForm}
              onDelete={handleDelete}
              onDragStart={handleDragStart}
              onDropStatus={handleDropStatus}
            />
          ))}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'タスクを編集' : 'タスクを新規登録'}>
        <TaskForm initial={editing} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>
    </div>
  );
}
