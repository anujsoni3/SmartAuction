import React from 'react';
import { LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, admin, logout } = useAuth();
  const currentUser = user || admin;
  const roleLabel = admin ? 'Admin' : 'User';

  return (
    <header className="theme-surface theme-border theme-transition sticky top-0 z-20 border-b px-4 py-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="theme-text text-[1.35rem] font-semibold tracking-tight sm:text-2xl">{title}</h1>
          <p className="theme-muted mt-1 text-sm">Auction Portal</p>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="theme-border theme-panel theme-transition hidden items-center gap-2 rounded-full border px-3 py-2 text-sm sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <User className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="theme-text font-medium">{currentUser?.name}</div>
              <div className="theme-muted flex items-center gap-1 text-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{roleLabel}</span>
              </div>
            </div>
          </div>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={logout}
            className="shrink-0 border border-slate-200 bg-white px-4 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};