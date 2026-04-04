import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { MetricCard } from '../../components/ui/MetricCard';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Bid } from '../../services/auctionService';
import { walletService } from '../../services/walletService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Activity,
  AlertCircle,
  Ban,
  CheckCircle,
  Clock,
  Gavel,
  Home,
  RefreshCw,
  Search,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { path: '/user/auctions', label: 'Browse Auctions', icon: <Search className="h-4 w-4" /> },
  { path: '/user/bids', label: 'My Bids', icon: <Gavel className="h-4 w-4" /> },
  { path: '/user/wallet', label: 'Wallet', icon: <Wallet className="h-4 w-4" /> },
];

const statusConfig: Record<string, { label: string; className: string; icon: LucideIcon }> = {
  success: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100', icon: CheckCircle },
  failed: { label: 'Failed', className: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100', icon: Ban },
  rolledback: { label: 'Cancelled', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100', icon: AlertCircle },
};

export const UserBids: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollbackLoading, setRollbackLoading] = useState<string | null>(null);

  const { showError, showSuccess } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    void loadUserBids();
  }, []);

  const loadUserBids = async () => {
    setLoading(true);
    try {
      const data = await auctionService.getUserBids();
      setBids(data);
    } catch {
      showError('Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };

  const handleRollbackBid = async (bidId?: string) => {
    if (!bidId || !user?.username) return;

    const confirmed = window.confirm('Cancel this bid? The amount will be refunded to your wallet.');
    if (!confirmed) return;

    setRollbackLoading(bidId);
    try {
      await walletService.rollbackBid({ bid_id: bidId, username: user.username });
      showSuccess('Bid cancelled and amount refunded');
      await loadUserBids();
    } catch {
      showError('Failed to cancel bid');
    } finally {
      setRollbackLoading(null);
    }
  };

  const { totalBidAmount, activeBids, failedBids } = useMemo(() => {
    const total = bids.reduce((sum, bid) => sum + (bid.amount ?? 0), 0);
    const active = bids.filter((bid) => bid.status === 'success').length;
    return { totalBidAmount: total, activeBids: active, failedBids: bids.length - active };
  }, [bids]);

  const bidColumns = [
    {
      key: 'product_name',
      label: 'Product',
      render: (value: string, row: Bid) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">{value}</div>
            <div className="text-xs text-slate-500">ID: {row.product_id}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'auction_id',
      label: 'Auction',
      render: (value: string) => (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {value}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Bid Amount',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-emerald-700">₹{value?.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'timestamp',
      label: 'Date & Time',
      render: (value: string) => (
        <div className="text-sm text-slate-600">
          <div className="font-medium text-slate-900">{new Date(value).toLocaleDateString()}</div>
          <div className="text-xs text-slate-500">{new Date(value).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const config = statusConfig[value] ?? statusConfig.failed;
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.className}`}>
            <Icon className="h-3.5 w-3.5" />
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: unknown, row: Bid) =>
        row.status === 'success' ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleRollbackBid(row.bid_id)}
            loading={rollbackLoading === row.bid_id}
            disabled={rollbackLoading !== null}
            className="border border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
          >
            <RefreshCw className={`h-4 w-4 ${rollbackLoading === row.bid_id ? 'animate-spin' : ''}`} />
            Cancel
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-400">
            <Ban className="h-3.5 w-3.5" />
            N/A
          </span>
        ),
    },
  ];

  if (loading) {
    return (
      <Layout title="My Bids" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <span className="text-sm font-medium text-slate-600">Loading bids...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Bids" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        <Card padding="lg" className="overflow-hidden border-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white shadow-soft">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 ring-1 ring-white/15">
                <Activity className="h-3.5 w-3.5" />
                Bid ledger
              </div>
              <h2 className="text-3xl font-semibold tracking-tight">My Bids</h2>
              <p className="max-w-2xl text-sm leading-6 text-white/80 sm:text-base">Track active bids, review outcomes, and cancel eligible bids before auctions close.</p>
            </div>
            <Button
              variant="secondary"
              onClick={loadUserBids}
              className="border-0 bg-white text-brand-700 hover:bg-white/90"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Bids" value={bids.length} icon={Gavel} tone="brand" />
          <MetricCard label="Active Bids" value={activeBids} icon={TrendingUp} tone="success" />
          <MetricCard label="Cancelled" value={failedBids} icon={TrendingDown} tone="danger" />
          <MetricCard label="Total Amount" value={`₹${totalBidAmount.toLocaleString()}`} icon={Clock} tone="neutral" />
        </div>

        <Card className="border border-brand-100 bg-brand-50/60" padding="lg">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-900">Bid management</h4>
              <p className="mt-1 text-sm leading-6 text-brand-800/80">
                You can cancel active bids before the auction ends. The amount is refunded to your wallet immediately.
              </p>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Bid History</h3>
                <p className="text-sm text-slate-500">Recent bid activity across all auctions</p>
              </div>
            </div>
          </div>

          {bids.length === 0 ? (
            <EmptyState />
          ) : (
            <Table columns={bidColumns} data={bids} density="compact" emptyMessage="No bids found" />
          )}
        </Card>
      </div>
    </Layout>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <Gavel className="h-6 w-6" />
    </div>
    <h4 className="mt-4 text-base font-semibold text-slate-900">No bids yet</h4>
    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
      You haven't placed any bids yet. Browse active auctions to get started.
    </p>
    <Button
      onClick={() => (window.location.href = '/user/auctions')}
      className="mt-6"
    >
      <Search className="h-4 w-4" />
      Browse Auctions
      <ArrowRight className="h-4 w-4" />
    </Button>
  </div>
);
