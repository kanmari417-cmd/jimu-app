import { Router } from 'express';
import * as TasksService from '../services/tasks.js';
import type { TaskInput, TaskStatus } from '../types/task.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const STATUSES: TaskStatus[] = ['提出待ち', '確認中', '完了'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseTaskInput(
  body: unknown,
  { partial }: { partial: boolean },
): { data?: Partial<TaskInput>; error?: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'リクエストボディが不正です' };
  }
  const b = body as Record<string, unknown>;
  const data: Partial<TaskInput> = {};

  if (!partial || b.target_name !== undefined) {
    if (typeof b.target_name !== 'string' || !b.target_name.trim()) {
      return { error: '対象者名(target_name)は必須です' };
    }
    data.target_name = b.target_name.trim();
  }
  if (!partial || b.type !== undefined) {
    if (typeof b.type !== 'string' || !b.type.trim()) {
      return { error: '種別(type)は必須です' };
    }
    data.type = b.type.trim();
  }
  if (!partial || b.staff_name !== undefined) {
    if (typeof b.staff_name !== 'string' || !b.staff_name.trim()) {
      return { error: '担当者(staff_name)は必須です' };
    }
    data.staff_name = b.staff_name.trim();
  }
  if (!partial || b.due_date !== undefined) {
    if (typeof b.due_date !== 'string' || !DATE_RE.test(b.due_date)) {
      return { error: '期限(due_date)はYYYY-MM-DD形式で指定してください' };
    }
    data.due_date = b.due_date;
  }
  if (b.status !== undefined) {
    if (typeof b.status !== 'string' || !STATUSES.includes(b.status as TaskStatus)) {
      return { error: `ステータス(status)は ${STATUSES.join('/')} のいずれかを指定してください` };
    }
    data.status = b.status as TaskStatus;
  }

  return { data };
}

export const tasksRouter = Router();

tasksRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    res.json(await TasksService.listTasks());
  }),
);

tasksRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const task = await TasksService.getTask(Number(req.params.id));
    if (!task) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.json(task);
  }),
);

tasksRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = parseTaskInput(req.body, { partial: false });
    if (error || !data) {
      res.status(400).json({ error });
      return;
    }
    const created = await TasksService.createTask(data as TaskInput);
    res.status(201).json(created);
  }),
);

tasksRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { data, error } = parseTaskInput(req.body, { partial: true });
    if (error || !data) {
      res.status(400).json({ error });
      return;
    }
    const updated = await TasksService.updateTask(id, data);
    if (!updated) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.json(updated);
  }),
);

tasksRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const success = await TasksService.deleteTask(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.status(204).send();
  }),
);
