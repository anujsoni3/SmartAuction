import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { MetricCard } from '../../components/ui/MetricCard';
import { auctionService, Auction, Bid } from '../../services/auctionService';
import { walletService, Transaction } from '../../services/walletService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Activity,
  Clock,
  CreditCard,
  ChevronRight,
  Eye,
  Gavel,
  Home,
  Search,
  Timer,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

const userNavItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { path: '/user/auctions', label: 'Auctions', icon: <Search className="h-4 w-4" /> },
  { path: '/user/bids', label: 'My Bids', icon: <Gavel className="h-4 w-4" /> },
  { path: '/user/wallet', label: 'Wallet', icon: <Wallet className="h-4 w-4" /> },
];

type BidLite = Pick<Bid, 'amount' | 'status' | 'timestamp' | 'auction_id'>;

export const UserDashboard: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [userBids, setUserBids] = useState<BidLite[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    if (!user?.username) return;

    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [auctionsData, txData, bidsData] = await Promise.all([
          auctionService.getAuctions(),
          walletService.getTransactions(),
          auctionService.getUserBids(),
        ]);

        setAuctions(auctionsData.slice(0, 5));
        setTransactions(txData);
        setUserBids(bidsData);

        try {
          const wallet = await walletService.getWalletBalance(user.username);
          setWalletBalance(wallet?.wallet_balance ?? null);
        } catch {
          const totalAdded = txData.filter((t) => t.type === 'topup').reduce((sum, t) => sum + (t.amount ?? 0), 0);
          const totalSpent = txData.filter((t) => t.type === 'bid').reduce((sum, t) => sum + (t.amount ?? 0), 0);
          setWalletBalance(totalAdded - totalSpent);
        }
      } catch {
        setAuctions([]);
        setTransactions([]);
        setUserBids([]);
        setWalletBalance(null);
      } finally {
        setLoading(false);
      }
    };

    void loadDashboardData();
  }, [user?.username]);

  const { activeAuctions, endingSoon, totalSpent } = useMemo(() => {
    const now = new Date();
    const active = auctions.filter((a) => new Date(a.valid_until) > now);
    const ending = auctions.filter((a) => {
      const diff = new Date(a.valid_until).getTime() - now.getTime();
      return diff > 0 && diff < 86_400_000;
    });
    const spent = transactions.filter((t) => t.type === 'bid').reduce((sum, t) => sum + (t.amount ?? 0), 0);
    return { activeAuctions: active, endingSoon: ending, totalSpent: spent };
  }, [auctions, transactions]);

  if (loading) {
    return (
      <Layout sidebarItems={userNavItems} sidebarTitle="User">
        <PageLoader />
      </Layout>
    );
  }

  return (
    <Layout sidebarItems={userNavItems} sidebarTitle="User">
      <div className="space-y-6">

        {/* Welcome hero card */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 text-white"
          style={{
            background: 'linear-gradient(135deg, #009e72 0%, #00D09C 60%, #00b886 100%)',
            boxShadow: '0 8px 32px rgba(0,208,156,0.3)',
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/70 uppercase tracking-wider">Welcome back</p>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{user?.name} 👋</h2>
              <p className="text-sm text-white/75">
                {activeAuctions.length} active auctions · {endingSoon.length} ending soon
              </p>
            </div>

            <div
              className="flex shrink-0 flex-col items-end gap-3 rounded-2xl p-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
            >
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider">Wallet Balance</p>
              <p className="text-3xl font-extrabold tracking-tight">
                {walletBalance === null ? '—' : `₹${walletBalance.toLocaleString('en-IN')}`}
              </p>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  onClick={() => { window.location.href = '/user/auctions'; }}
                  variant="ghost"
                  className="border-white/30 text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Browse
                </Button>
                <Button
                  size="xs"
                  onClick={() => { window.location.href = '/user/wallet'; }}
                  variant="ghost"
                  className="border-white/30 text-white"
                  style={{ border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Wallet
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Active Auctions" value={activeAuctions.length} icon={Gavel} tone="brand" />
          <MetricCard label="Ending Soon" value={endingSoon.length} icon={Timer} tone="warning" />
          <MetricCard label="My Bids" value={userBids.length} icon={TrendingUp} tone="success" />
          <MetricCard label="Total Spent" value={`₹${totalSpent.toLocaleString('en-IN')}`} icon={CreditCard} tone="danger" />
        </div>

        {/* Quick action */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { window.location.href = '/user/auctions?registered=1'; }}
          >
            <Eye className="h-4 w-4" />
            My Registered Auctions
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Two-col feed */}
        <div className="grid gap-6 lg:grid-cols-2">

          {/* Recent Auctions */}
          <Card padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--app-primary-soft)', color: 'var(--app-primary)' }}
                >
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>Recent Auctions</p>
                  <p className="text-xs" style={{ color: 'var(--app-muted)' }}>Latest opportunities</p>
                </div>
              </div>
              <Button variant="ghost" size="xs" onClick={() => { window.location.href = '/user/auctions'; }}>
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {activeAuctions.length === 0 ? (
              <EmptyState label="No active auctions yet" />
            ) : (
              <div className="space-y-2">
                {auctions.map((auction) => (
                  <div
                    key={auction.id}
                    className="theme-transition flex items-center justify-between rounded-xl px-4 py-3"
                    style={{ backgroundColor: 'var(--app-panel)', border: '1px solid var(--app-border)' }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: 'var(--app-text)' }}>
                        {auction.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--app-muted)' }}>ID: {auction.id}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--app-muted)' }}>
                        <Clock className="h-3 w-3" />
                        {new Date(auction.valid_until).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Transactions */}
          <Card padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'rgba(0,208,156,0.1)', color: '#00D09C' }}
                >
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>Recent Transactions</p>
                  <p className="text-xs" style={{ color: 'var(--app-muted)' }}>Wallet activity</p>
                </div>
              </div>
              <Button variant="ghost" size="xs" onClick={() => { window.location.href = '/user/wallet'; }}>
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>

            {transactions.length === 0 ? (
              <EmptyState label="No transactions yet" />
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 5).map((tx) => {
                  const isBid = tx.type === 'bid';
                  return (
                    <div
                      key={tx._id}
                      className="theme-transition flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ backgroundColor: 'var(--app-panel)', border: '1px solid var(--app-border)' }}
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: isBid ? 'rgba(239,68,68,0.1)' : 'rgba(0,208,156,0.1)',
                          color: isBid ? '#dc2626' : '#00D09C',
                        }}
                      >
                        {isBid ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold capitalize" style={{ color: 'var(--app-text)' }}>
                          {isBid ? 'Bid Placed' : 'Top-up'}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--app-muted)' }}>
                          {new Date(tx.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <p className="text-sm font-bold" style={{ color: isBid ? '#dc2626' : '#00D09C' }}>
                        {isBid ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div
    className="flex flex-col items-center justify-center rounded-xl py-12 text-center"
    style={{ backgroundColor: 'var(--app-panel)', border: '1.5px dashed var(--app-border)' }}
  >
    <Gavel className="h-10 w-10 mb-3" style={{ color: 'var(--app-disabled)' }} />
    <p className="text-sm font-medium" style={{ color: 'var(--app-muted)' }}>{label}</p>
  </div>
);

const PageLoader: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div
        className="h-10 w-10 animate-spin rounded-full"
        style={{ border: '3px solid var(--app-border)', borderTopColor: 'var(--app-primary)' }}
      />
      <p className="text-sm font-medium" style={{ color: 'var(--app-muted)' }}>Loading dashboard…</p>
    </div>
  </div>
);
