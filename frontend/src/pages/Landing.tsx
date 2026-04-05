import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gavel, Shield, Users, Wallet, Zap, TrendingUp, Clock, BadgeCheck, ChevronRight } from 'lucide-react';

const stats = [
  { value: '2,400+', label: 'Live Auctions' },
  { value: '₹18Cr+', label: 'Bids Placed' },
  { value: '98%', label: 'Secure Transactions' },
];

const features = [
  {
    icon: Zap,
    title: 'Real-time Bidding',
    description: 'Instant bid updates with live countdown timers and real-time status signals.',
    color: '#00D09C',
    bg: 'rgba(0,208,156,0.1)',
  },
  {
    icon: Shield,
    title: 'Secure & Transparent',
    description: 'Encrypted wallet actions, ACID-compliant transactions, full audit trail.',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.1)',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Separate Admin and User portals with focused workflows and permissions.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
  },
  {
    icon: TrendingUp,
    title: 'Bid Analytics',
    description: 'Track your bidding history, spending, and portfolio in one dashboard.',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.1)',
  },
  {
    icon: Wallet,
    title: 'Integrated Wallet',
    description: 'Top-up, bid, and manage your balance from a single, clear account view.',
    color: '#00D09C',
    bg: 'rgba(0,208,156,0.1)',
  },
  {
    icon: Clock,
    title: 'Smart Notifications',
    description: 'Get alerted when you\'re outbid, when auctions end, or when you win.',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.1)',
  },
];

export const Landing: React.FC = () => {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}
    >
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav
        className="navbar sticky top-0 z-40"
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                background: 'linear-gradient(135deg,#00D09C,#00b886)',
                boxShadow: '0 2px 8px rgba(0,208,156,0.35)',
              }}
            >
              <Gavel className="h-4 w-4 text-white" />
            </div>
            <span
              className="hidden text-sm font-bold tracking-tight sm:block"
              style={{ color: 'var(--app-text)' }}
            >
              SmartAuction
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:flex"
              style={{
                backgroundColor: 'rgba(0,208,156,0.1)',
                color: '#00D09C',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: '#00D09C', animation: 'livePulse 1.6s ease-in-out infinite' }}
              />
              Platform Live
            </span>

            <Link
              to="/user/login"
              className="theme-transition rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ color: 'var(--app-muted)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--app-text)';
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--app-panel)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--app-muted)';
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent';
              }}
            >
              Login
            </Link>
            <Link
              to="/user/register"
              className="theme-transition inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg,#00D09C,#00b886)',
                boxShadow: '0 2px 8px rgba(0,208,156,0.3)',
              }}
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-25 blur-[80px]"
          style={{ background: 'radial-gradient(ellipse,#00D09C 0%,transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute top-20 right-0 h-64 w-64 rounded-full opacity-15 blur-[60px]"
          style={{ background: '#3B82F6' }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center">
            <span
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(0,208,156,0.1)',
                color: '#00D09C',
                border: '1px solid rgba(0,208,156,0.2)',
              }}
            >
              <BadgeCheck className="h-4 w-4" />
              India's smartest auction management platform
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mx-auto max-w-4xl text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: 'var(--app-text)', lineHeight: '1.15' }}
          >
            Bid smarter.{' '}
            <span
              className="relative"
              style={{ color: '#00D09C' }}
            >
              Win faster.
            </span>
            <br />
            Trade with confidence.
          </h1>

          <p
            className="mx-auto mt-6 max-w-2xl text-center text-base leading-7 sm:text-lg"
            style={{ color: 'var(--app-muted)' }}
          >
            SmartAuction brings real-time bidding with live updates, secure wallet management,
            and transparent transactions — all in one sleek platform.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/user/login"
              className="theme-transition inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg,#00D09C,#00b886)',
                boxShadow: '0 4px 16px rgba(0,208,156,0.4)',
              }}
            >
              <Gavel className="h-5 w-5" />
              Start Bidding
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/admin/login"
              className="theme-transition inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold"
              style={{
                backgroundColor: 'var(--app-surface)',
                color: 'var(--app-text)',
                border: '1.5px solid var(--app-border)',
                boxShadow: '0 1px 4px var(--app-shadow)',
              }}
            >
              Admin Portal
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Stats strip */}
          <div
            className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-2xl"
            style={{ backgroundColor: 'var(--app-border)' }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center py-5 px-4 text-center"
                style={{ backgroundColor: 'var(--app-surface)' }}
              >
                <span
                  className="text-2xl font-extrabold tracking-tight"
                  style={{ color: 'var(--app-text)' }}
                >
                  {s.value}
                </span>
                <span
                  className="mt-1 text-xs font-medium"
                  style={{ color: 'var(--app-muted)' }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ color: 'var(--app-text)' }}
          >
            Everything you need to bid with confidence
          </h2>
          <p className="mt-3 text-sm" style={{ color: 'var(--app-muted)' }}>
            From real-time updates to wallet management — SmartAuction covers every step.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="sa-card theme-transition group p-6 hover:-translate-y-0.5"
              >
                <div
                  className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: f.bg, color: f.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3
                  className="mb-2 text-base font-semibold tracking-tight"
                  style={{ color: 'var(--app-text)' }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-6" style={{ color: 'var(--app-muted)' }}>
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl p-10 text-center"
          style={{
            background: 'linear-gradient(135deg, #00D09C 0%, #00a070 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          <div className="relative">
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
              Ready to place your first bid?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-white/80">
              Join thousands of bidders on SmartAuction — secure, fast, and always live.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/user/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-600 shadow-lg hover:bg-white/95 transition-all hover:-translate-y-0.5"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/user/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        className="border-t py-8 text-center text-xs"
        style={{ borderColor: 'var(--app-border)', color: 'var(--app-muted)' }}
      >
        © {new Date().getFullYear()} SmartAuction · Built for buyers, bidders, and administrators.
      </footer>
    </div>
  );
};
