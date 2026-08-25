import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost, apiPut } from '../api/client';
import type { Template, TemplateInput } from '../types/template';

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Template[]>('/templates');
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const createTemplate = useCallback(
    async (input: TemplateInput) => {
      await apiPost('/templates', input);
      await reload();
    },
    [reload],
  );

  const updateTemplate = useCallback(
    async (id: number, input: Partial<TemplateInput>) => {
      await apiPut(`/templates/${id}`, input);
      await reload();
    },
    [reload],
  );

  const deleteTemplate = useCallback(
    async (id: number) => {
      await apiDelete(`/templates/${id}`);
      await reload();
    },
    [reload],
  );

  return { templates, loading, error, reload, createTemplate, updateTemplate, deleteTemplate };
}
