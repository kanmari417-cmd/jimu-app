import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import ApiStatus from './ApiStatus';
import { CashIcon, ChatIcon, ClipboardCheckIcon, ClockIcon } from './icons';

const NAV_ITEMS = [
  { to: '/payments', label: '着金入力管理', shortLabel: '着金', icon: CashIcon },
  { to: '/tasks', label: '未提出チェック', shortLabel: '未提出', icon: ClipboardCheckIcon },
  { to: '/templates', label: '定型メッセージ', shortLabel: 'メッセージ', icon: ChatIcon },
  { to: '/availability', label: '空き時間提案', shortLabel: '空き時間', icon: ClockIcon },
] as const;

function topNavLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
    isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
  ].join(' ');
}

function bottomNavLinkClass({ isActive }: { isActive: boolean }) {
  return [
    'flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[11px] font-medium transition-colors',
    isActive ? 'text-blue-600' : 'text-gray-400',
  ].join(' ');
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-start justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">jimu-app</h1>
            <p className="text-xs text-gray-500">営業事務 業務管理システム</p>
          </div>
          <ApiStatus />
        </div>
        {/* デスクトップ/タブレット向けの上部タブナビゲーション */}
        <nav className="mx-auto hidden max-w-6xl gap-1 overflow-x-auto px-4 pb-3 sm:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={topNavLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 sm:pb-6">{children}</main>

      {/* モバイル向けの下部タブナビゲーション */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-gray-200 bg-white px-2 py-1 shadow-[0_-1px_4px_rgba(0,0,0,0.04)] sm:hidden">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={bottomNavLinkClass}>
              <Icon className="h-5 w-5" />
              {item.shortLabel}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
