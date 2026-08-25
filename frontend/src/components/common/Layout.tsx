import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/payments', label: '着金入力管理' },
  { to: '/tasks', label: '未提出チェック' },
  { to: '/templates', label: '定型メッセージ' },
  { to: '/availability', label: '空き時間提案' },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
    isActive
      ? 'bg-blue-600 text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  ].join(' ');
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">jimu-app</h1>
          <p className="text-xs text-gray-500">営業事務 業務管理システム</p>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
