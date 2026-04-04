import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import { MetricCard } from '../../components/ui/MetricCard';
import { useToast } from '../../components/ui/Toast';
import { walletService, Transaction } from '../../services/walletService';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Download,
  Gavel,
  History,
  Home,
  Plus,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';

const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { path: '/user/auctions', label: 'Browse Auctions', icon: <Search className="h-4 w-4" /> },
  { path: '/user/bids', label: 'My Bids', icon: <Gavel className="h-4 w-4" /> },
  { path: '/user/wallet', label: 'Wallet', icon: <Wallet className="h-4 w-4" /> },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export const UserWallet: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [balanceFromAPI, setBalanceFromAPI] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [topupModal, setTopupModal] = useState(false);
  const [topupBusy, setTopupBusy] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      try {
        const wallet = await walletService.getWalletBalance(user.username);
        setBalanceFromAPI(wallet?.wallet_balance ?? null);
      } catch {
        setBalanceFromAPI(null);
      }

      try {
        const tx = await walletService.getTransactions();
        setTransactions(tx);
      } catch {
        setTransactions([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const { totalAdded, totalSpent, derivedBalance } = useMemo(() => {
    const added = transactions.filter((transaction) => transaction.type === 'topup').reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0);
    const spent = transactions.filter((transaction) => transaction.type === 'bid').reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0);
    return { totalAdded: added, totalSpent: spent, derivedBalance: added - spent };
  }, [transactions]);

  const currentBalance = balanceFromAPI ?? derivedBalance;

  const columns = [
    {
      key: 'type',
      label: 'Transaction Type',
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${value === 'bid' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-100' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'}`}>
            {value === 'bid' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
          </div>
          <span className="font-medium text-slate-900">{value === 'bid' ? 'Bid Placed' : 'Funds Added'}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number, row: Transaction) => (
        <span className={`font-semibold ${row.type === 'bid' ? 'text-rose-700' : 'text-emerald-700'}`}>
          {row.type === 'bid' ? '-' : '+'}₹{value.toLocaleString()}
        </span>
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
      key: 'meta',
      label: 'Description',
      render: (value: Transaction['meta'], row: Transaction) => (
        <div className="text-sm text-slate-600">
          <div className="font-medium text-slate-900">
            {value?.notes || (row.type === 'bid' ? 'Bid placed on auction' : 'Wallet top-up')}
          </div>
          {value?.product_id ? (
            <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
              Product: {value.product_id}
            </span>
          ) : null}
        </div>
      ),
    },
  ];

  const downloadCSV = () => {
    if (transactions.length === 0) {
      showError('No transactions to export');
      return;
    }

    const header = Object.keys(transactions[0]).join(',');
    const rows = transactions.map((transaction) =>
      Object.values(transaction).map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')
    );
    const csv = [header, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'transactions.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    showSuccess('CSV downloaded');
  };

  const doTopup = async () => {
    const amount = Number.parseFloat(topupAmount);
    if (Number.isNaN(amount) || amount < 10 || amount > 100000) {
      showError('Enter an amount between ₹10 and ₹1,00,000');
      return;
    }

    setTopupBusy(true);
    try {
      await walletService.topupWallet(amount);
      showSuccess(`Added ₹${amount.toLocaleString()} to your wallet`);
      setTopupModal(false);
      setTopupAmount('');
      await loadData();
    } catch {
      showError('Top-up failed');
    } finally {
      setTopupBusy(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Wallet" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <span className="text-sm font-medium text-slate-600">Loading wallet...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Wallet" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        <Card padding="lg" className="overflow-hidden border-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white shadow-soft">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 ring-1 ring-white/15">
                  <Shield className="h-3.5 w-3.5" />
                  Secure bidding wallet
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">Wallet Balance</h2>
                <p className="mt-2 text-sm text-white/75">Available for bidding</p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-4 lg:items-end">
              <div className="text-4xl font-semibold tracking-tight sm:text-5xl">₹{currentBalance.toLocaleString()}</div>
              <Button
                onClick={() => setTopupModal(true)}
                className="border-0 bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Plus className="h-4 w-4" />
                Add Funds
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Total Added" value={`₹${totalAdded.toLocaleString()}`} icon={TrendingUp} tone="success" />
          <MetricCard label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} icon={Gavel} tone="danger" />
          <MetricCard label="Total Transactions" value={transactions.length} icon={History} tone="brand" />
        </div>

        <Card padding="lg" className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Quick Add Funds</h3>
                <p className="text-sm text-slate-500">Fast top-up options for frequent bidders</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setTopupModal(true)}>
              <Plus className="h-4 w-4" />
              Custom amount
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {QUICK_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setTopupAmount(String(amount));
                  setTopupModal(true);
                }}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50/40"
              >
                <div>
                  <p className="text-sm font-medium text-slate-500">Quick add</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">₹{amount.toLocaleString()}</p>
                </div>
                <CreditCard className="h-5 w-5 text-brand-700" />
              </button>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Transaction History</h3>
                <p className="text-sm text-slate-500">Track wallet additions and bid deductions</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={loadData} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="secondary" onClick={downloadCSV}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <Table columns={columns} data={transactions} density="compact" emptyMessage="No transactions found. Add funds to start bidding." />
        </Card>
      </div>

      <Modal
        isOpen={topupModal}
        onClose={() => {
          setTopupModal(false);
          setTopupAmount('');
        }}
        title="Add Funds to Wallet"
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
            <div className="flex items-center gap-2 text-brand-700">
              <Wallet className="h-4 w-4" />
              <h4 className="font-semibold">Current balance</h4>
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">₹{currentBalance.toLocaleString()}</p>
          </div>

          <Input
            label="Amount to Add (₹)"
            type="number"
            value={topupAmount}
            onChange={(event) => setTopupAmount(event.target.value)}
            placeholder="Enter amount"
            min="10"
            max="100000"
          />

          <div>
            <p className="text-sm font-semibold text-slate-700">Quick select</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK_AMOUNTS.map((amount) => (
                <Button key={amount} variant="secondary" size="sm" onClick={() => setTopupAmount(String(amount))}>
                  ₹{amount.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setTopupModal(false);
                setTopupAmount('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={doTopup} loading={topupBusy} className="flex-1 bg-brand-600 hover:bg-brand-700">
              Add Funds
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
