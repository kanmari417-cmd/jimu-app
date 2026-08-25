import { useMemo, useState } from 'react';
import Banner from '../components/common/Banner';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import PageHeader from '../components/common/PageHeader';
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
      <PageHeader title="③ 定型メッセージ管理">
        <button
          onClick={openCreateForm}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 新規登録
        </button>
      </PageHeader>

      {error && <Banner tone="error">{error}</Banner>}

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
        <EmptyState>該当するテンプレートがありません。</EmptyState>
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
