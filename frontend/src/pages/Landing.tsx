import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gavel, Shield, Users, Wallet, Sparkles, BadgeCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const features = [
  {
    icon: Gavel,
    title: 'Real-time Bidding',
    description: 'Live auction updates with instant bid tracking and clear status signals.',
  },
  {
    icon: Shield,
    title: 'Secure Transactions',
    description: 'Encrypted wallet actions and transparent transaction history.',
  },
  {
    icon: Users,
    title: 'Role-based Access',
    description: 'Separate user and admin portals with focused navigation and flows.',
  },
];

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#f5f7fb_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white/80 px-5 py-4 shadow-card backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/20">
              <Gavel className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-900">SmartAuction</p>
              <p className="text-xs text-slate-500">Auction Management System</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100 sm:flex">
            <BadgeCheck className="h-3.5 w-3.5" />
            Live auction platform
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center py-10 lg:py-16">
          <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
                <Sparkles className="h-3.5 w-3.5" />
                Clean, responsive, and built for fast bidding
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                  A sleek auction platform for buyers, bidders, and administrators.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Browse active auctions, manage your wallet, track bids, and run operations from a modern, focused interface.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/user/login">
                  <Button size="lg" className="shadow-sm">
                    Login as User
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/admin/login">
                  <Button size="lg" variant="secondary" className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                    Login as Admin
                  </Button>
                </Link>
              </div>
            </div>

            <Card padding="lg" className="border border-slate-200/80 bg-white shadow-soft">
              <div className="space-y-5">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Auction wallet</p>
                      <p className="text-2xl font-semibold tracking-tight text-slate-900">Balance-first bidding</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Keep funds visible, bid quickly, and review every transaction from one account view.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { value: 'Live', label: 'Auction status' },
                    { value: 'Fast', label: 'Bid execution' },
                    { value: 'Clear', label: 'Wallet history' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                      <p className="text-lg font-semibold text-slate-900">{item.value}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </section>

          <section className="mt-12 grid gap-4 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="h-full border border-slate-200/80 bg-white shadow-card">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{feature.description}</p>
                </Card>
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
};
