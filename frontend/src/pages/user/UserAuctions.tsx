import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { MetricCard } from '../../components/ui/MetricCard';
import { useToast } from '../../components/ui/Toast';
import { auctionService, Auction, Product } from '../../services/auctionService';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import {
  Clock,
  Eye,
  Gavel,
  Home,
  Search,
  Timer,
  Wallet,
  ArrowRight,
  BadgeCheck,
  Zap,
} from 'lucide-react';

const userNavItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { path: '/user/auctions', label: 'Auctions', icon: <Search className="h-4 w-4" /> },
  { path: '/user/bids', label: 'My Bids', icon: <Gavel className="h-4 w-4" /> },
  { path: '/user/wallet', label: 'Wallet', icon: <Wallet className="h-4 w-4" /> },
];

export const UserAuctions: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productBids, setProductBids] = useState<Record<string, { highest_bid?: number }>>({});
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});
  const [registeredAuctions, setRegisteredAuctions] = useState<Set<string>>(new Set());
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);

  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadAuctions = async () => {
      try {
        const [allAuctions, myAuctionRes] = await Promise.all([
          auctionService.getAuctions(),
          authService.getMyAuctions(),
        ]);
        setAuctions(allAuctions);
        setRegisteredAuctions(new Set((myAuctionRes?.user_details?.auctions || []).map(String)));
        setTimeLeft(allAuctions.reduce<Record<string, number>>((acc, a) => {
          acc[a.id] = getSecondsLeft(a.valid_until);
          return acc;
        }, {}));
      } catch {
        showError('Failed to load auctions');
      } finally {
        setLoading(false);
      }
    };
    void loadAuctions();
  }, [showError]);

  useEffect(() => {
    if (!auctions.length) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setTimeLeft(auctions.reduce<Record<string, number>>((acc, a) => {
        acc[a.id] = Math.max(0, Math.floor((new Date(a.valid_until).getTime() - now) / 1000));
        return acc;
      }, {}));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [auctions]);

  const filteredAuctions = useMemo(() =>
    auctions.filter((a) => {
      const q = searchTerm.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q);
    }), [auctions, searchTerm]);

  const activeCount = useMemo(() => auctions.filter((a) => getSecondsLeft(a.valid_until) > 0).length, [auctions]);
  const endingSoonCount = useMemo(() => auctions.filter((a) => {
    const d = new Date(a.valid_until).getTime() - Date.now();
    return d > 0 && d < 86_400_000;
  }).length, [auctions]);

  const handleViewProducts = async (auction: Auction) => {
    setSelectedAuction(auction);
    setProductsLoading(true);
    try {
      const data = await auctionService.getAuctionProducts(auction.id);
      setProducts(data);
      const bids = await Promise.all(data.map(async (p) => {
        try { return [p.id, await auctionService.getHighestBid(p.id)] as const; }
        catch { return [p.id, { highest_bid: 0 }] as const; }
      }));
      setProductBids(Object.fromEntries(bids));
    } catch {
      showError('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleRegister = async (auctionId: string) => {
    try {
      await auctionService.registerForAuction(auctionId);
      showSuccess('Successfully registered for auction');
      setRegisteredAuctions((prev) => new Set(prev).add(auctionId));
    } catch {
      showError('Failed to register');
    }
  };

  const handlePlaceBid = async () => {
    if (!selectedProduct || !bidAmount || !user) { showError('Please enter a valid bid amount'); return; }
    const amount = Number.parseFloat(bidAmount);
    const currentHighest = productBids[selectedProduct.id]?.highest_bid ?? 0;
    if (Number.isNaN(amount) || amount <= currentHighest) {
      showError(`Bid must be higher than ₹${currentHighest}`); return;
    }
    setBidLoading(true);
    try {
      await auctionService.placeBid({ product_name: selectedProduct.name, bid_amount: amount, user_id: user.username });
      showSuccess('Bid placed successfully!');
      setShowBidModal(false); setBidAmount(''); setSelectedProduct(null);
      if (selectedAuction) await handleViewProducts(selectedAuction);
    } catch {
      showError('Failed to place bid');
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) return (
    <Layout sidebarItems={userNavItems} sidebarTitle="User">
      <PageLoader />
    </Layout>
  );

  const currentHighest = selectedProduct ? (productBids[selectedProduct.id]?.highest_bid ?? 0) : 0;

  return (
    <Layout sidebarItems={userNavItems} sidebarTitle="User">
      <div className="space-y-6">
        {/* Header strip */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--app-text)' }}>
              Browse Auctions
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--app-muted)' }}>
              Discover live auctions, register, and place your bids.
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-xs font-semibold sm:self-auto"
            style={{ backgroundColor: 'var(--app-primary-soft)', color: 'var(--app-primary)' }}
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            Live Auction Discovery
          </span>
        </div>

        {/* Metrics */}
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Active" value={activeCount} icon={Zap} tone="brand" />
          <MetricCard label="Ending Soon" value={endingSoonCount} icon={Timer} tone="warning" />
          <MetricCard label="Registered" value={registeredAuctions.size} icon={Eye} tone="success" />
        </div>

        {/* Search bar */}
        <div
          className="flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center"
          style={{ backgroundColor: 'var(--app-surface)', border: '1px solid var(--app-border)' }}
        >
          <div className="flex-1">
            <Input
              placeholder="Search auctions by name or ID…"
              icon={<Search className="h-4 w-4" />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="sm" className="shrink-0" onClick={() => setSearchTerm('')}>
            Clear
          </Button>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Left — Auction list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>
                Active Auctions
              </p>
              <p className="text-xs" style={{ color: 'var(--app-muted)' }}>
                {filteredAuctions.length} result{filteredAuctions.length !== 1 ? 's' : ''}
              </p>
            </div>

            {filteredAuctions.length === 0 ? (
              <Card padding="lg">
                <EmptyState title="No auctions found" description="Try a different search term or clear the filter." />
              </Card>
            ) : (
              filteredAuctions.map((auction) => {
                const secondsLeft = timeLeft[auction.id] ?? getSecondsLeft(auction.valid_until);
                const ended = secondsLeft <= 0;
                const registered = registeredAuctions.has(auction.id);

                return (
                  <Card key={auction.id} padding="lg" hoverable>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold" style={{ color: 'var(--app-text)' }}>
                              {auction.name}
                            </h3>
                            <p className="mt-0.5 text-xs" style={{ color: 'var(--app-muted)' }}>
                              ID: {auction.id}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                              ended
                                ? 'bg-red-50 text-red-600'
                                : secondsLeft < 3600
                                ? 'bg-amber-50 text-amber-700'
                                : ''
                            }`}
                            style={!ended && secondsLeft >= 3600 ? {
                              backgroundColor: 'var(--app-primary-soft)',
                              color: 'var(--app-primary)',
                            } : {}}
                          >
                            {ended ? 'Ended' : secondsLeft < 3600 ? '⚡ Hot' : '🟢 Live'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
                            style={{ backgroundColor: 'var(--app-panel)', color: 'var(--app-muted)' }}
                          >
                            <Clock className="h-3 w-3" />
                            Ends {new Date(auction.valid_until).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold"
                            style={{
                              backgroundColor: ended ? 'rgba(239,68,68,0.1)' : 'var(--app-primary-soft)',
                              color: ended ? '#dc2626' : 'var(--app-primary)',
                            }}
                          >
                            <Timer className="h-3 w-3" />
                            {formatTimeLeft(secondsLeft)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-row gap-2 sm:flex-col sm:items-end">
                        <Button size="sm" variant="secondary" onClick={() => handleViewProducts(auction)}>
                          <Eye className="h-3.5 w-3.5" />
                          Products
                        </Button>
                        {registered ? (
                          <span
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
                            style={{ backgroundColor: 'var(--app-primary-soft)', color: 'var(--app-primary)' }}
                          >
                            <BadgeCheck className="h-3.5 w-3.5" />
                            Registered
                          </span>
                        ) : (
                          <Button size="sm" onClick={() => handleRegister(auction.id)} disabled={ended}>
                            Register
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* Right — Product panel */}
          <div className="lg:sticky lg:top-[4.5rem] self-start">
            <Card padding="lg" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--app-text)' }}>
                    {selectedAuction ? selectedAuction.name : 'Select an auction'}
                  </h3>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--app-muted)' }}>
                    Products and bid actions appear here.
                  </p>
                </div>
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'var(--app-primary-soft)', color: 'var(--app-primary)' }}
                >
                  <Gavel className="h-4 w-4" />
                </div>
              </div>

              {!selectedAuction ? (
                <EmptyState title="Nothing selected" description="Choose an auction from the list to see its products." />
              ) : productsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div
                    className="h-8 w-8 animate-spin rounded-full"
                    style={{ border: '2.5px solid var(--app-border)', borderTopColor: 'var(--app-primary)' }}
                  />
                </div>
              ) : products.length === 0 ? (
                <EmptyState title="No products yet" description="This auction doesn't have any products." />
              ) : (
                <div className="space-y-3">
                  {products.map((product) => {
                    const highestBid = productBids[product.id]?.highest_bid ?? 0;
                    const registered = registeredAuctions.has(selectedAuction.id);
                    const isEnded = (timeLeft[selectedAuction.id] ?? 0) <= 0;
                    const isSold = product.status === 'sold';

                    return (
                      <div
                        key={product.id}
                        className="theme-transition rounded-xl p-4"
                        style={{
                          backgroundColor: 'var(--app-panel)',
                          border: '1px solid var(--app-border)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold" style={{ color: 'var(--app-text)' }}>
                              {product.name}
                            </p>
                            {product.description && (
                              <p className="mt-1 text-xs leading-5" style={{ color: 'var(--app-muted)' }}>
                                {product.description}
                              </p>
                            )}
                          </div>
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={isSold
                              ? { backgroundColor: 'rgba(239,68,68,0.1)', color: '#dc2626' }
                              : { backgroundColor: 'rgba(0,208,156,0.1)', color: '#00D09C' }
                            }
                          >
                            {isSold ? 'Sold' : 'Available'}
                          </span>
                        </div>

                        <div
                          className="mt-3 flex items-center justify-between border-t pt-3"
                          style={{ borderColor: 'var(--app-border)' }}
                        >
                          <div>
                            <p className="text-xs" style={{ color: 'var(--app-muted)' }}>Highest bid</p>
                            <p className="text-base font-extrabold" style={{ color: 'var(--app-primary)' }}>
                              {highestBid > 0 ? `₹${highestBid.toLocaleString('en-IN')}` : 'No bids yet'}
                            </p>
                          </div>
                          {registered ? (
                            <Button
                              size="sm"
                              disabled={isSold || isEnded}
                              onClick={() => { setSelectedProduct(product); setShowBidModal(true); }}
                            >
                              <Gavel className="h-3.5 w-3.5" />
                              Place Bid
                            </Button>
                          ) : (
                            <span className="text-xs font-medium" style={{ color: 'var(--app-muted)' }}>
                              Register to bid
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <Modal
        isOpen={showBidModal}
        onClose={() => { setShowBidModal(false); setBidAmount(''); setSelectedProduct(null); }}
        title="Place Your Bid"
        subtitle={selectedProduct?.name}
      >
        <div className="space-y-5">
          {/* Product summary */}
          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--app-panel)', border: '1px solid var(--app-border)' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--app-muted)' }}>Current highest bid</p>
              <p className="text-xl font-extrabold" style={{ color: 'var(--app-primary)' }}>
                {currentHighest > 0 ? `₹${currentHighest.toLocaleString('en-IN')}` : 'No bids yet'}
              </p>
            </div>
          </div>

          {/* Quick bid buttons */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
              Quick bid
            </p>
            <div className="flex flex-wrap gap-2">
              {[50, 100, 250, 500].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setBidAmount(String(currentHighest + inc))}
                  className="theme-transition rounded-lg px-3 py-1.5 text-sm font-semibold"
                  style={{
                    backgroundColor: 'var(--app-primary-soft)',
                    color: 'var(--app-primary)',
                    border: '1px solid rgba(0,208,156,0.2)',
                  }}
                >
                  +{inc}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Your bid amount (₹)"
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={`Min: ₹${currentHighest + 1}`}
            min={currentHighest + 1}
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => { setShowBidModal(false); setBidAmount(''); setSelectedProduct(null); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handlePlaceBid} loading={bidLoading} className="flex-1">
              <Gavel className="h-4 w-4" />
              Place Bid
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div
    className="flex flex-col items-center justify-center rounded-xl py-12 text-center"
    style={{ backgroundColor: 'var(--app-panel)', border: '1.5px dashed var(--app-border)' }}
  >
    <div
      className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
      style={{ backgroundColor: 'var(--app-surface)', color: 'var(--app-disabled)' }}
    >
      <Gavel className="h-6 w-6" />
    </div>
    <p className="text-sm font-semibold" style={{ color: 'var(--app-text)' }}>{title}</p>
    <p className="mt-1 max-w-[220px] text-xs" style={{ color: 'var(--app-muted)' }}>{description}</p>
  </div>
);

const PageLoader: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div
        className="h-10 w-10 animate-spin rounded-full"
        style={{ border: '3px solid var(--app-border)', borderTopColor: 'var(--app-primary)' }}
      />
      <p className="text-sm font-medium" style={{ color: 'var(--app-muted)' }}>Loading auctions…</p>
    </div>
  </div>
);

const getSecondsLeft = (iso: string) => Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));

const formatTimeLeft = (seconds: number) => {
  if (seconds <= 0) return 'Ended';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
};
