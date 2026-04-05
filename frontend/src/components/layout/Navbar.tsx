import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Gavel, Menu, X, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface NavbarProps {
  items: NavItem[];
  portalLabel: string;
}

export const Navbar: React.FC<NavbarProps> = ({ items, portalLabel }) => {
  const location = useLocation();
  const { user, admin, logout } = useAuth();
  const currentUser = user || admin;
  const isAdmin = !!admin;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="navbar sticky top-0 z-40 transition-all duration-200"
      >
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #00D09C 0%, #00b886 100%)',
                boxShadow: '0 2px 8px rgba(0,208,156,0.35)',
              }}
            >
              <Gavel className="h-4 w-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span
                className="text-sm font-bold tracking-tight"
                style={{ color: 'var(--app-text)' }}
              >
                SmartAuction
              </span>
              <span
                className="ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: isAdmin ? 'rgba(59,130,246,0.1)' : 'var(--app-primary-soft)',
                  color: isAdmin ? '#3B82F6' : 'var(--app-primary)',
                }}
              >
                {portalLabel}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="theme-transition group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                  style={{
                    color: active ? 'var(--app-primary)' : 'var(--app-muted)',
                    backgroundColor: active ? 'var(--app-primary-soft)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.color = 'var(--app-text)';
                      el.style.backgroundColor = 'var(--app-panel)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      const el = e.currentTarget as HTMLAnchorElement;
                      el.style.color = 'var(--app-muted)';
                      el.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span
                    style={{ color: active ? 'var(--app-primary)' : 'var(--app-muted)' }}
                    className="theme-transition"
                  >
                    {item.icon}
                  </span>
                  {item.label}
                  {active && (
                    <span
                      className="ml-0.5 h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: 'var(--app-primary)' }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex shrink-0 items-center gap-2">
            {/* User Badge */}
            <div
              className="hidden items-center gap-2 rounded-lg px-3 py-1.5 md:flex"
              style={{
                backgroundColor: 'var(--app-panel)',
                border: '1px solid var(--app-border)',
              }}
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: isAdmin ? '#3B82F6' : 'var(--app-primary)' }}
              >
                {currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div className="hidden lg:block">
                <p
                  className="text-xs font-semibold leading-none"
                  style={{ color: 'var(--app-text)' }}
                >
                  {currentUser?.name}
                </p>
                <p
                  className="mt-0.5 flex items-center gap-1 text-[10px] leading-none"
                  style={{ color: 'var(--app-muted)' }}
                >
                  {isAdmin ? (
                    <ShieldCheck className="h-2.5 w-2.5" />
                  ) : (
                    <User className="h-2.5 w-2.5" />
                  )}
                  {isAdmin ? 'Admin' : 'User'}
                </p>
              </div>
            </div>

            <ThemeToggle />

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="theme-transition hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold md:flex"
              style={{
                color: 'var(--app-muted)',
                border: '1px solid var(--app-border)',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.color = '#dc2626';
                el.style.borderColor = '#fca5a5';
                el.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.color = 'var(--app-muted)';
                el.style.borderColor = 'var(--app-border)';
                el.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="theme-transition flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
              style={{
                backgroundColor: 'var(--app-panel)',
                color: 'var(--app-muted)',
                border: '1px solid var(--app-border)',
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            className="animate-slide-up border-t px-4 pb-4 pt-3 md:hidden"
            style={{
              backgroundColor: 'var(--app-surface)',
              borderColor: 'var(--app-border)',
            }}
          >
            {/* Mobile user info */}
            <div
              className="mb-3 flex items-center gap-3 rounded-xl p-3"
              style={{ backgroundColor: 'var(--app-panel)' }}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: isAdmin ? '#3B82F6' : 'var(--app-primary)' }}
              >
                {currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>
                  {currentUser?.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--app-muted)' }}>
                  {isAdmin ? 'Admin' : 'User'} · {currentUser?.username}
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              {items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="theme-transition flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium"
                    style={{
                      color: active ? 'var(--app-primary)' : 'var(--app-muted)',
                      backgroundColor: active ? 'var(--app-primary-soft)' : 'transparent',
                    }}
                  >
                    <span style={{ color: active ? 'var(--app-primary)' : 'var(--app-muted)' }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}

              <button
                type="button"
                onClick={() => { setMobileOpen(false); logout(); }}
                className="theme-transition flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-danger-600"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Active nav indicator line */}
    </>
  );
};
