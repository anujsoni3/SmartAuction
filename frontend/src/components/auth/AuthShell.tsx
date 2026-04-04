import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';

interface AuthShellProps {
  title: string;
  subtitle: string;
  accent: 'user' | 'admin';
  icon: LucideIcon;
  switchText: string;
  switchLinkText: string;
  switchTo: string;
  children: React.ReactNode;
}

export const AuthShell: React.FC<AuthShellProps> = ({
  title,
  subtitle,
  accent,
  icon: Icon,
  switchText,
  switchLinkText,
  switchTo,
  children,
}) => {
  const accentClasses =
    accent === 'admin'
      ? 'from-[#8C5A3C] via-[#C08552] to-[#4B2E2B]'
      : 'from-brand-600 via-brand-500 to-[#8C5A3C]';

  return (
    <div className="theme-bg theme-transition relative min-h-screen overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-24 -top-16 h-72 w-72 rounded-full bg-[var(--app-panel)] blur-3xl" />
        <div className="absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-[var(--app-primary)]/25 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center justify-center lg:min-h-[calc(100vh-4rem)]">
        <div className="grid w-full overflow-hidden rounded-3xl border theme-border shadow-soft lg:grid-cols-[1fr_1fr]">
          <div className={`relative hidden flex-col justify-between bg-gradient-to-br ${accentClasses} p-10 text-white lg:flex`}>
            <div>
              <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-medium backdrop-blur hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>

            <div className="space-y-5">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                <Icon className="h-7 w-7" />
              </div>
              <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
              <p className="max-w-sm text-base leading-7 text-white/85">{subtitle}</p>
              <div className="space-y-2 text-sm text-white/80">
                <p>Real-time updates</p>
                <p>Secure wallet flow</p>
                <p>Professional bidding interface</p>
              </div>
            </div>
          </div>

          <Card className="theme-surface theme-transition m-0 rounded-none border-0 p-0" padding="lg">
            <div className="mx-auto w-full max-w-md py-2">
              <div className="mb-6 flex items-center justify-between lg:hidden">
                <Link to="/" className="theme-muted inline-flex items-center gap-2 rounded-full px-2 py-1 text-sm hover:theme-text">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${accentClasses} text-white shadow-lg`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              {children}

              <div className="theme-muted mt-6 text-center text-sm">
                {switchText}{' '}
                <Link to={switchTo} className="font-semibold text-[var(--app-primary-strong)] hover:underline">
                  {switchLinkText}
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
