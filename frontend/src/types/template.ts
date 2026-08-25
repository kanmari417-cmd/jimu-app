export type TemplateCategory = '採用事務' | 'Slack投稿' | '顧客対応';

export interface Template {
  id: number;
  category: TemplateCategory;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateInput {
  category: TemplateCategory;
  title: string;
  body: string;
}
