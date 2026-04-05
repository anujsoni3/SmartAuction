import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;  // accepted but unused — Navbar handles page title display
  sidebarItems: Array<{
    path: string;
    label: string;
    icon: React.ReactNode;
  }>;
  sidebarTitle: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  sidebarItems,
  sidebarTitle,
}) => {
  return (
    <div
      className="theme-transition flex min-h-screen flex-col"
      style={{ backgroundColor: 'var(--app-bg)' }}
    >
      <Navbar items={sidebarItems} portalLabel={sidebarTitle} />
      <main className="scrollbar-thin flex-1 overflow-auto">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};