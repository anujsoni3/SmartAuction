import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LucideIcon, CheckCircle2 } from 'lucide-react';
import { Gavel } from 'lucide-react';

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

const perks = [
  'Real-time auction updates',
  'Secure encrypted wallet',
  'Instant bid confirmation',
  'Full transaction history',
];

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
  const isAdmin = accent === 'admin';
  const panelColor = isAdmin ? '#3B82F6' : '#00D09C';
  const panelGrad = isAdmin
    ? 'linear-gradient(145deg, #1d4ed8 0%, #3B82F6 50%, #1e40af 100%)'
    : 'linear-gradient(145deg, #009e72 0%, #00D09C 50%, #00b886 100%)';

  return (
    <div
      className="theme-transition relative min-h-screen"
      style={{ backgroundColor: 'var(--app-bg)' }}
    >
      {/* Background atmospheric orbs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-40 -left-20 h-80 w-80 rounded-full opacity-20 blur-[80px]"
          style={{ backgroundColor: panelColor }}
        />
        <div
          className="absolute bottom-0 right-0 h-64 w-64 rounded-full opacity-10 blur-[60px]"
          style={{ backgroundColor: panelColor }}
        />
      </div>

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        {/* ── Left Brand Panel (desktop only) ── */}
        <div
          className="hidden flex-col justify-between p-10 lg:flex lg:w-[44%] xl:w-[40%]"
          style={{ background: panelGrad }}
        >
          {/* Top */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
              <Gavel className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">SmartAuction</span>
          </div>

          {/* Middle */}
          <div className="space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold leading-tight text-white">{title}</h1>
              <p className="mt-3 max-w-xs text-sm leading-6 text-white/75">{subtitle}</p>
            </div>
            <ul className="space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5 text-sm text-white/85">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-white/60" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom */}
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} SmartAuction. Secured & Encrypted.
          </p>
        </div>

        {/* ── Right Form Panel ── */}
        <div
          className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-16"
          style={{ backgroundColor: 'var(--app-surface)' }}
        >
          {/* Mobile back + logo */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link
              to="/"
              className="theme-transition flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium"
              style={{ color: 'var(--app-muted)', backgroundColor: 'var(--app-panel)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: panelGrad }}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Desktop back link */}
          <Link
            to="/"
            className="theme-transition mb-8 hidden items-center gap-1.5 text-xs font-medium lg:flex"
            style={{ color: 'var(--app-muted)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <div className="mx-auto w-full max-w-sm">
            {children}

            <div className="mt-6 text-center text-sm" style={{ color: 'var(--app-muted)' }}>
              {switchText}{' '}
              <Link
                to={switchTo}
                className="font-semibold"
                style={{ color: panelColor }}
              >
                {switchLinkText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
