import { Router } from 'express';
import * as ExpensesService from '../services/expenses.js';
import { extractReceipt } from '../services/expenseExtraction.js';
import type { ExpenseCategory, ExpenseInput, ExpenseStatus } from '../types/expense.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const CATEGORIES: ExpenseCategory[] = ['交通費', '接待交際費', '消耗品費', '会議費', 'その他'];
const STATUSES: ExpenseStatus[] = ['下書き', '申請中', '承認済み', '却下'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// data URL文字列の上限(概ね5MB程度の画像までを想定)
const MAX_IMAGE_LENGTH = 7_000_000;

function parseExpenseInput(
  body: unknown,
  { partial }: { partial: boolean },
): { data?: Partial<ExpenseInput>; error?: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'リクエストボディが不正です' };
  }
  const b = body as Record<string, unknown>;
  const data: Partial<ExpenseInput> = {};

  if (!partial || b.date !== undefined) {
    if (typeof b.date !== 'string' || !DATE_RE.test(b.date)) {
      return { error: '日付(date)はYYYY-MM-DD形式で指定してください' };
    }
    data.date = b.date;
  }
  if (!partial || b.category !== undefined) {
    if (typeof b.category !== 'string' || !CATEGORIES.includes(b.category as ExpenseCategory)) {
      return { error: `カテゴリ(category)は ${CATEGORIES.join('/')} のいずれかを指定してください` };
    }
    data.category = b.category as ExpenseCategory;
  }
  if (!partial || b.staff_name !== undefined) {
    if (typeof b.staff_name !== 'string' || !b.staff_name.trim()) {
      return { error: '申請者(staff_name)は必須です' };
    }
    data.staff_name = b.staff_name.trim();
  }
  if (!partial || b.vendor !== undefined) {
    if (typeof b.vendor !== 'string' || !b.vendor.trim()) {
      return { error: '支払先(vendor)は必須です' };
    }
    data.vendor = b.vendor.trim();
  }
  if (!partial || b.amount !== undefined) {
    if (typeof b.amount !== 'number' || Number.isNaN(b.amount) || b.amount < 0) {
      return { error: '金額(amount)は0以上の数値で指定してください' };
    }
    data.amount = b.amount;
  }
  if (b.receipt_image !== undefined) {
    if (b.receipt_image !== null) {
      if (typeof b.receipt_image !== 'string' || !b.receipt_image.startsWith('data:image/')) {
        return { error: '領収書画像(receipt_image)の形式が不正です' };
      }
      if (b.receipt_image.length > MAX_IMAGE_LENGTH) {
        return { error: '領収書画像のサイズが大きすぎます' };
      }
    }
    data.receipt_image = b.receipt_image as string | null;
  }
  if (b.status !== undefined) {
    if (typeof b.status !== 'string' || !STATUSES.includes(b.status as ExpenseStatus)) {
      return { error: `ステータス(status)は ${STATUSES.join('/')} のいずれかを指定してください` };
    }
    data.status = b.status as ExpenseStatus;
  }
  if (b.notes !== undefined) {
    data.notes = b.notes === null ? null : String(b.notes);
  }

  return { data };
}

export const expensesRouter = Router();

expensesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, month } = req.query;
    const expenses = await ExpensesService.listExpenses({
      status: typeof status === 'string' ? status : undefined,
      month: typeof month === 'string' ? month : undefined,
    });
    res.json(expenses);
  }),
);

// ":id" より先に定義しないと "/summary/monthly" や "/extract" が :id にマッチしてしまう
expensesRouter.get(
  '/summary/monthly',
  asyncHandler(async (_req, res) => {
    res.json(await ExpensesService.monthlySummary());
  }),
);

expensesRouter.post(
  '/extract',
  asyncHandler(async (req, res) => {
    const { image } = req.body ?? {};
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      res.status(400).json({ error: '画像データ(image)が不正です' });
      return;
    }
    if (image.length > MAX_IMAGE_LENGTH) {
      res.status(400).json({ error: '画像サイズが大きすぎます' });
      return;
    }
    try {
      const extracted = await extractReceipt(image);
      res.json(extracted);
    } catch (err) {
      console.error('領収書の自動読み取りに失敗しました', err);
      const message = err instanceof Error ? err.message : '自動読み取りに失敗しました';
      res.status(502).json({ error: message });
    }
  }),
);

expensesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const expense = await ExpensesService.getExpense(Number(req.params.id));
    if (!expense) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.json(expense);
  }),
);

expensesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = parseExpenseInput(req.body, { partial: false });
    if (error || !data) {
      res.status(400).json({ error });
      return;
    }
    const created = await ExpensesService.createExpense(data as ExpenseInput);
    res.status(201).json(created);
  }),
);

expensesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { data, error } = parseExpenseInput(req.body, { partial: true });
    if (error || !data) {
      res.status(400).json({ error });
      return;
    }
    const updated = await ExpensesService.updateExpense(id, data);
    if (!updated) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.json(updated);
  }),
);

expensesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const success = await ExpensesService.deleteExpense(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.status(204).send();
  }),
);
