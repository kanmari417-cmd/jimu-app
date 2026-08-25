import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client';
import type { Task, TaskInput } from '../types/task';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Task[]>('/tasks');
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const createTask = useCallback(
    async (input: TaskInput) => {
      await apiPost('/tasks', input);
      await reload();
    },
    [reload],
  );

  const updateTask = useCallback(
    async (id: number, input: Partial<TaskInput>) => {
      // 楽観的更新: ドラッグ&ドロップの見た目を即時反映してから再取得する
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...input } as Task : t)));
      try {
        await apiPut(`/tasks/${id}`, input);
      } finally {
        await reload();
      }
    },
    [reload],
  );

  const deleteTask = useCallback(
    async (id: number) => {
      await apiDelete(`/tasks/${id}`);
      await reload();
    },
    [reload],
  );

  return { tasks, loading, error, reload, createTask, updateTask, deleteTask };
}
