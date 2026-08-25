import type { ReactNode } from 'react';

type Props = {
  title: string;
  children?: ReactNode;
};

export default function PageHeader({ title, children }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
