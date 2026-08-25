import type { ReactNode } from 'react';

/** 一覧が空のときに表示する共通プレースホルダー。全機能で見た目を統一する。 */
export default function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
      {children}
    </div>
  );
}
