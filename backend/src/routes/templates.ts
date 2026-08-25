import { Router } from 'express';
import * as TemplatesService from '../services/templates.js';
import type { TemplateCategory, TemplateInput } from '../types/template.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const CATEGORIES: TemplateCategory[] = ['採用事務', 'Slack投稿', '顧客対応'];

function parseTemplateInput(
  body: unknown,
  { partial }: { partial: boolean },
): { data?: Partial<TemplateInput>; error?: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'リクエストボディが不正です' };
  }
  const b = body as Record<string, unknown>;
  const data: Partial<TemplateInput> = {};

  if (!partial || b.category !== undefined) {
    if (typeof b.category !== 'string' || !CATEGORIES.includes(b.category as TemplateCategory)) {
      return { error: `カテゴリ(category)は ${CATEGORIES.join('/')} のいずれかを指定してください` };
    }
    data.category = b.category as TemplateCategory;
  }
  if (!partial || b.title !== undefined) {
    if (typeof b.title !== 'string' || !b.title.trim()) {
      return { error: 'タイトル(title)は必須です' };
    }
    data.title = b.title.trim();
  }
  if (!partial || b.body !== undefined) {
    if (typeof b.body !== 'string' || !b.body.trim()) {
      return { error: '本文(body)は必須です' };
    }
    data.body = b.body;
  }

  return { data };
}

export const templatesRouter = Router();

templatesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category } = req.query;
    res.json(await TemplatesService.listTemplates(typeof category === 'string' ? category : undefined));
  }),
);

templatesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const template = await TemplatesService.getTemplate(Number(req.params.id));
    if (!template) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.json(template);
  }),
);

templatesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = parseTemplateInput(req.body, { partial: false });
    if (error || !data) {
      res.status(400).json({ error });
      return;
    }
    const created = await TemplatesService.createTemplate(data as TemplateInput);
    res.status(201).json(created);
  }),
);

templatesRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { data, error } = parseTemplateInput(req.body, { partial: true });
    if (error || !data) {
      res.status(400).json({ error });
      return;
    }
    const updated = await TemplatesService.updateTemplate(id, data);
    if (!updated) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.json(updated);
  }),
);

templatesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const success = await TemplatesService.deleteTemplate(Number(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.status(204).send();
  }),
);
