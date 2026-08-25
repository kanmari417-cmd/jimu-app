import { useMemo, useState } from 'react';
import Modal from '../components/common/Modal';
import TemplateCard from '../components/templates/TemplateCard';
import TemplateForm from '../components/templates/TemplateForm';
import { useTemplates } from '../hooks/useTemplates';
import type { Template, TemplateCategory, TemplateInput } from '../types/template';

const CATEGORIES: Array<TemplateCategory | 'all'> = ['all', '採用事務', 'Slack投稿', '顧客対応'];

export default function TemplatesPage() {
  const { templates, loading, error, createTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Template | undefined>(undefined);

  const filteredTemplates = useMemo(
    () => (categoryFilter === 'all' ? templates : templates.filter((t) => t.category === categoryFilter)),
    [templates, categoryFilter],
  );

  function openCreateForm() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEditForm(template: Template) {
    setEditing(template);
    setFormOpen(true);
  }

  async function handleSubmit(input: TemplateInput) {
    if (editing) {
      await updateTemplate(editing.id, input);
    } else {
      await createTemplate(input);
    }
    setFormOpen(false);
  }

  async function handleDelete(template: Template) {
    if (!window.confirm(`「${template.title}」を削除しますか?`)) return;
    await deleteTemplate(template.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">③ 定型メッセージ管理</h2>
        <button
          onClick={openCreateForm}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 新規登録
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              categoryFilter === c ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c === 'all' ? 'すべて' : c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">読み込み中…</p>
      ) : filteredTemplates.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          該当するテンプレートがありません。
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((t) => (
            <TemplateCard key={t.id} template={t} onEdit={openEditForm} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'テンプレートを編集' : 'テンプレートを新規登録'}
      >
        <TemplateForm
          initial={editing}
          defaultCategory={categoryFilter !== 'all' ? categoryFilter : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>
    </div>
  );
}
