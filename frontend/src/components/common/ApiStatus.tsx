import { useEffect, useState } from 'react';
import { apiGet } from '../../api/client';

type HealthResponse = {
  status: string;
  timestamp: string;
};

export default function ApiStatus() {
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    apiGet<HealthResponse>('/health')
      .then(() => setState('ok'))
      .catch(() => setState('error'));
  }, []);

  const label =
    state === 'loading' ? 'API接続確認中…' : state === 'ok' ? 'API接続OK' : 'API接続エラー';
  const color =
    state === 'loading'
      ? 'bg-gray-100 text-gray-600'
      : state === 'ok'
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700';

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
