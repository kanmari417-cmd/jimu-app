import { sql } from '../db/postgres.js';
import type { TemplateInput, TemplateRecord } from '../types/template.js';

export async function listTemplates(category?: string): Promise<TemplateRecord[]> {
  if (category) {
    const { rows } = await sql.query<TemplateRecord>(
      'SELECT * FROM message_templates WHERE category = $1 ORDER BY updated_at DESC, id DESC',
      [category],
    );
    return rows;
  }
  const { rows } = await sql.query<TemplateRecord>('SELECT * FROM message_templates ORDER BY updated_at DESC, id DESC');
  return rows;
}

export async function getTemplate(id: number): Promise<TemplateRecord | undefined> {
  const { rows } = await sql.query<TemplateRecord>('SELECT * FROM message_templates WHERE id = $1', [id]);
  return rows[0];
}

export async function createTemplate(input: TemplateInput): Promise<TemplateRecord> {
  const { rows } = await sql.query<TemplateRecord>(
    `INSERT INTO message_templates (category, title, body, updated_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING *`,
    [input.category, input.title, input.body],
  );
  return rows[0];
}

export async function updateTemplate(id: number, input: Partial<TemplateInput>): Promise<TemplateRecord | undefined> {
  const existing = await getTemplate(id);
  if (!existing) return undefined;

  const merged: TemplateRecord = { ...existing, ...input };

  const { rows } = await sql.query<TemplateRecord>(
    `UPDATE message_templates SET category = $1, title = $2, body = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [merged.category, merged.title, merged.body, id],
  );
  return rows[0];
}

export async function deleteTemplate(id: number): Promise<boolean> {
  const { rowCount } = await sql.query('DELETE FROM message_templates WHERE id = $1', [id]);
  return (rowCount ?? 0) > 0;
}
