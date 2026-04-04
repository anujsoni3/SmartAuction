import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  title: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ items, title }) => {
  const location = useLocation();

  return (
    <aside className="theme-surface theme-border theme-transition flex min-h-screen w-72 flex-col border-r shadow-[8px_0_30px_rgba(15,23,42,0.03)] backdrop-blur">
      <div className="theme-border border-b px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg font-bold text-white shadow-lg shadow-brand-500/20">
            SA
          </div>
          <div>
            <h1 className="theme-text text-lg font-semibold tracking-tight">{title}</h1>
            <p className="theme-muted text-xs">SmartAuction</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`theme-transition group mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100'
                  : 'theme-muted hover:bg-[var(--app-panel)] hover:text-[var(--app-text)]'
              }`}
            >
              <span className={`${isActive ? 'text-brand-700' : 'text-slate-400 group-hover:text-slate-700'}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};