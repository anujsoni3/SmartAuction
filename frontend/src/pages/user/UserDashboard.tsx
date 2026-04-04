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
} from 'lucide-react';

const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { path: '/user/auctions', label: 'Browse Auctions', icon: <Search className="h-4 w-4" /> },
  { path: '/user/bids', label: 'My Bids', icon: <Gavel className="h-4 w-4" /> },
  { path: '/user/wallet', label: 'Wallet', icon: <Wallet className="h-4 w-4" /> },
];

type BidLite = Pick<Bid, 'amount' | 'status' | 'timestamp' | 'auction_id'>;
type Txn = Transaction;

export const UserDashboard: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [userBids, setUserBids] = useState<BidLite[]>([]);
  const [transactions, setTransactions] = useState<Txn[]>([]);
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

  const { activeAuctions, endingSoon, totalSpent, registeredAuctions } = useMemo(() => {
    const now = new Date();
    const active = auctions.filter((auction) => new Date(auction.valid_until) > now);
    const ending = auctions.filter((auction) => {
      const diff = new Date(auction.valid_until).getTime() - now.getTime();
      return diff > 0 && diff < 86_400_000;
    });
    const spent = transactions.filter((transaction) => transaction.type === 'bid').reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0);
    const registered = new Set(userBids.map((bid) => bid.auction_id).filter(Boolean));

    return {
      activeAuctions: active,
      endingSoon: ending,
      totalSpent: spent,
      registeredAuctions: registered.size,
    };
  }, [auctions, transactions, userBids]);

  if (loading) {
    return (
      <Layout title="Dashboard" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <span className="text-sm font-medium text-slate-600">Loading dashboard...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white shadow-soft" padding="lg">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.85fr] lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15">
                <Activity className="h-3.5 w-3.5" />
                Live auction overview
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome back, {user?.name}.</h2>
                <p className="max-w-2xl text-sm leading-6 text-white/82 sm:text-base">
                  Track auctions, monitor bids, and manage your wallet from one focused dashboard.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => (window.location.href = '/user/auctions')}
                  className="border-0 bg-white text-brand-700 hover:bg-white/90"
                >
                  <Eye className="h-4 w-4" />
                  Browse Auctions
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => (window.location.href = '/user/wallet')}
                  className="border border-white/20 bg-white/10 text-white hover:bg-white/15"
                >
                  <Wallet className="h-4 w-4" />
                  Wallet Details
                </Button>
              </div>
            </div>

            <div className="rounded-3xl bg-white/12 p-5 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between text-white/90">
                <span className="text-sm font-medium">Wallet Balance</span>
                <Wallet className="h-5 w-5" />
              </div>
              <div className="mt-3 text-4xl font-semibold tracking-tight">
                {walletBalance === null ? '—' : `₹${walletBalance.toLocaleString()}`}
              </div>
              <p className="mt-2 text-sm text-white/75">Available for bidding</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Active Auctions" value={activeAuctions.length} icon={Gavel} tone="brand" />
          <MetricCard label="Ending Soon" value={endingSoon.length} icon={Timer} tone="warning" />
          <MetricCard label="My Bids" value={userBids.length} icon={TrendingUp} tone="success" />
          <MetricCard label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} icon={CreditCard} tone="danger" />
          <MetricCard label="Registered Auctions" value={registeredAuctions} icon={Eye} tone="neutral" />
        </div>

        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={() => (window.location.href = '/user/auctions?registered=1')}
            className="border border-brand-200 bg-white text-brand-700 hover:bg-brand-50"
          >
            <Eye className="h-4 w-4" />
            My Registered Auctions
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card padding="lg" className="h-full">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">Recent Auctions</h3>
                  <p className="text-sm text-slate-500">Latest opportunities worth watching</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => (window.location.href = '/user/auctions')}>
                View all
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {activeAuctions.length === 0 ? (
              <EmptyState label="No active auctions available" />
            ) : (
              <div className="space-y-3">
                {auctions.map((auction) => (
                  <div
                    key={auction.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 transition hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <div className="min-w-0">
                      <h4 className="truncate font-semibold text-slate-900">{auction.name}</h4>
                      <p className="mt-1 text-sm text-slate-500">ID: {auction.id}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        Ends
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {new Date(auction.valid_until).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padding="lg" className="h-full">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">Recent Transactions</h3>
                  <p className="text-sm text-slate-500">Wallet activity and bid deductions</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => (window.location.href = '/user/wallet')}>
                View all
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {transactions.length === 0 ? (
              <EmptyState label="No transactions yet" />
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${transaction.type === 'bid' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-100' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'}`}>
                        {transaction.type === 'bid' ? <TrendingUp className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium capitalize text-slate-900">{transaction.type}</h4>
                        <p className="text-sm text-slate-500">{new Date(transaction.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${transaction.type === 'bid' ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {transaction.type === 'bid' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">
    <Gavel className="h-12 w-12 text-slate-300" />
    <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
  </div>
);
