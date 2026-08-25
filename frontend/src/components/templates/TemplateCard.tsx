import { useState } from 'react';
import type { Template } from '../../types/template';

const CATEGORY_STYLE: Record<Template['category'], string> = {
  採用事務: 'bg-purple-100 text-purple-700',
  Slack投稿: 'bg-amber-100 text-amber-700',
  顧客対応: 'bg-blue-100 text-blue-700',
};

function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // クリップボードAPIが使えない環境向けのフォールバック
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (err) {
      reject(err instanceof Error ? err : new Error('コピーに失敗しました'));
    } finally {
      document.body.removeChild(textarea);
    }
  });
}

type Props = {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (template: Template) => void;
};

export default function TemplateCard({ template, onEdit, onDelete }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await copyToClipboard(template.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.alert('コピーに失敗しました。手動で選択してコピーしてください。');
    }
  }

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <span
            className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLE[template.category]}`}
          >
            {template.category}
          </span>
          <h3 className="text-sm font-semibold text-gray-900">{template.title}</h3>
        </div>
      </div>
      <pre className="mb-3 max-h-40 flex-1 overflow-y-auto whitespace-pre-wrap break-words rounded-md bg-gray-50 p-3 font-sans text-sm text-gray-700">
        {template.body}
      </pre>
      <div className="flex items-center justify-between">
        <button
          onClick={handleCopy}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            copied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {copied ? '✓ コピーしました' : 'コピー'}
        </button>
        <div className="flex gap-3 text-xs">
          <button onClick={() => onEdit(template)} className="text-blue-600 hover:underline">
            編集
          </button>
          <button onClick={() => onDelete(template)} className="text-red-600 hover:underline">
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
