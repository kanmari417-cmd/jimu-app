import type { ReactNode } from 'react';

type Tone = 'alert' | 'error';

const TONE_STYLE: Record<Tone, string> = {
  alert: 'border-red-200 bg-red-50 text-red-700',
  error: 'border-red-200 bg-red-50 text-red-700',
};

type Props = {
  tone?: Tone;
  children: ReactNode;
};

/** ページ上部に表示する警告・エラー用のバナー。全機能で見た目を統一する。 */
export default function Banner({ tone = 'alert', children }: Props) {
  return <div className={`rounded-lg border px-4 py-3 text-sm ${TONE_STYLE[tone]}`}>{children}</div>;
}
