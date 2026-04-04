import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  sidebarItems: Array<{
    path: string;
    label: string;
    icon: React.ReactNode;
  }>;
  sidebarTitle: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  sidebarItems,
  sidebarTitle
}) => {
  return (
    <div className="theme-bg theme-transition flex min-h-screen">
      <Sidebar items={sidebarItems} title={sidebarTitle} />
      <div className="theme-transition flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="scrollbar-thin theme-transition flex-1 overflow-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};