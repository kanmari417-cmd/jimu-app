import { db } from '../db/database.js';
import type { TemplateInput, TemplateRecord } from '../types/template.js';

export function listTemplates(category?: string): TemplateRecord[] {
  if (category) {
    return db
      .prepare('SELECT * FROM message_templates WHERE category = ? ORDER BY updated_at DESC, id DESC')
      .all(category) as TemplateRecord[];
  }
  return db
    .prepare('SELECT * FROM message_templates ORDER BY updated_at DESC, id DESC')
    .all() as TemplateRecord[];
}

export function getTemplate(id: number): TemplateRecord | undefined {
  return db.prepare('SELECT * FROM message_templates WHERE id = ?').get(id) as TemplateRecord | undefined;
}

export function createTemplate(input: TemplateInput): TemplateRecord {
  const stmt = db.prepare(`
    INSERT INTO message_templates (category, title, body, updated_at)
    VALUES (@category, @title, @body, datetime('now'))
  `);
  const result = stmt.run(input);
  return getTemplate(Number(result.lastInsertRowid))!;
}

export function updateTemplate(id: number, input: Partial<TemplateInput>): TemplateRecord | undefined {
  const existing = getTemplate(id);
  if (!existing) return undefined;

  const merged: TemplateRecord = { ...existing, ...input };

  db.prepare(`
    UPDATE message_templates SET
      category = @category,
      title = @title,
      body = @body,
      updated_at = datetime('now')
    WHERE id = @id
  `).run({ ...merged, id });

  return getTemplate(id);
}

export function deleteTemplate(id: number): boolean {
  const result = db.prepare('DELETE FROM message_templates WHERE id = ?').run(id);
  return result.changes > 0;
}
