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
  TrendingUp,
  Wallet,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';

const userSidebarItems = [
  { path: '/user/dashboard', label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { path: '/user/auctions', label: 'Browse Auctions', icon: <Search className="h-4 w-4" /> },
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
        setTimeLeft(
          allAuctions.reduce<Record<string, number>>((acc, auction) => {
            acc[auction.id] = getSecondsLeft(auction.valid_until);
            return acc;
          }, {})
        );
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
      setTimeLeft(
        auctions.reduce<Record<string, number>>((acc, auction) => {
          acc[auction.id] = Math.max(0, Math.floor((new Date(auction.valid_until).getTime() - now) / 1000));
          return acc;
        }, {})
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [auctions]);

  const filteredAuctions = useMemo(() => {
    return auctions.filter((auction) => {
      const query = searchTerm.toLowerCase();
      return auction.name.toLowerCase().includes(query) || auction.id.toLowerCase().includes(query);
    });
  }, [auctions, searchTerm]);

  const activeCount = useMemo(
    () => auctions.filter((auction) => getSecondsLeft(auction.valid_until) > 0).length,
    [auctions]
  );

  const endingSoonCount = useMemo(
    () => auctions.filter((auction) => {
      const diff = new Date(auction.valid_until).getTime() - Date.now();
      return diff > 0 && diff < 86_400_000;
    }).length,
    [auctions]
  );

  const handleViewProducts = async (auction: Auction) => {
    setSelectedAuction(auction);
    setProductsLoading(true);
    try {
      const data = await auctionService.getAuctionProducts(auction.id);
      setProducts(data);

      const bids = await Promise.all(
        data.map(async (product) => {
          try {
            const highest = await auctionService.getHighestBid(product.id);
            return [product.id, highest] as const;
          } catch {
            return [product.id, { highest_bid: 0 }] as const;
          }
        })
      );

      setProductBids(Object.fromEntries(bids));
    } catch {
      showError('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const handleRegisterForAuction = async (auctionId: string) => {
    try {
      await auctionService.registerForAuction(auctionId);
      showSuccess('Successfully registered for auction');
      setRegisteredAuctions((prev) => new Set(prev).add(auctionId));
    } catch {
      showError('Failed to register');
    }
  };

  const handlePlaceBid = async () => {
    if (!selectedProduct || !bidAmount || !user) {
      showError('Please enter a valid bid amount');
      return;
    }

    const amount = Number.parseFloat(bidAmount);
    const currentHighest = productBids[selectedProduct.id]?.highest_bid ?? 0;

    if (Number.isNaN(amount) || amount <= currentHighest) {
      showError(`Bid must be higher than ₹${currentHighest}`);
      return;
    }

    setBidLoading(true);
    try {
      await auctionService.placeBid({
        product_name: selectedProduct.name,
        bid_amount: amount,
        user_id: user.username,
      });
      showSuccess('Bid placed successfully');
      setShowBidModal(false);
      setBidAmount('');
      setSelectedProduct(null);
      if (selectedAuction) {
        await handleViewProducts(selectedAuction);
      }
    } catch {
      showError('Failed to place bid');
    } finally {
      setBidLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Browse Auctions" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-card">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
            <span className="text-sm font-medium text-slate-600">Loading auctions...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Browse Auctions" sidebarItems={userSidebarItems} sidebarTitle="User Portal">
      <div className="space-y-6">
        <Card padding="lg" className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
                <BadgeCheck className="h-3.5 w-3.5" />
                Live auction discovery
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Browse auctions with a cleaner, faster workflow</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Search active auctions, inspect products, and register before bidding.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[44rem] xl:grid-cols-3">
              <MetricCard label="Active" value={activeCount} icon={Gavel} tone="brand" />
              <MetricCard label="Ending Soon" value={endingSoonCount} icon={Timer} tone="warning" />
              <MetricCard label="Registered" value={registeredAuctions.size} icon={Eye} tone="success" />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search auctions by name or ID"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <Button variant="secondary" className="shrink-0" onClick={() => setSearchTerm('')}>
              <Search className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">Active Auctions</h3>
                <p className="text-sm text-slate-500">{filteredAuctions.length} auction{filteredAuctions.length === 1 ? '' : 's'} visible</p>
              </div>
            </div>

            {filteredAuctions.length === 0 ? (
              <Card padding="lg">
                <EmptyState title="No auctions found" description="Try a different search term or clear the filter." />
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredAuctions.map((auction) => {
                  const secondsLeft = timeLeft[auction.id] ?? getSecondsLeft(auction.valid_until);
                  const ended = secondsLeft <= 0;
                  const registered = registeredAuctions.has(auction.id);

                  return (
                    <Card key={auction.id} padding="lg" className="transition hover:-translate-y-0.5 hover:shadow-soft">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1 space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h4 className="truncate text-lg font-semibold tracking-tight text-slate-900">{auction.name}</h4>
                              <p className="mt-1 text-sm text-slate-500">Auction ID: {auction.id}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${ended ? 'bg-rose-50 text-rose-700' : secondsLeft < 3600 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {ended ? 'Ended' : 'Live'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                              <Clock className="h-3.5 w-3.5" />
                              Ends {new Date(auction.valid_until).toLocaleString()}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                              <Timer className="h-3.5 w-3.5" />
                              {formatTimeLeft(secondsLeft)} remaining
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 lg:min-w-[12rem] lg:items-end">
                          <Button size="sm" variant="secondary" onClick={() => handleViewProducts(auction)} className="w-full justify-center lg:w-auto">
                            <Eye className="h-4 w-4" />
                            View Products
                          </Button>
                          {registered ? (
                            <span className="inline-flex items-center justify-center rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-brand-100">
                              Registered
                            </span>
                          ) : (
                            <Button size="sm" onClick={() => handleRegisterForAuction(auction.id)} disabled={ended} className="w-full justify-center lg:w-auto">
                              Register
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 self-start">
            <Card padding="lg" className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                    {selectedAuction ? selectedAuction.name : 'Select an auction'}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">Product list and bid actions appear here.</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <Gavel className="h-5 w-5" />
                </div>
              </div>

              {!selectedAuction ? (
                <EmptyState title="Nothing selected yet" description="Choose an auction to view its products and bid options." />
              ) : productsLoading ? (
                <Loader />
              ) : products.length === 0 ? (
                <EmptyState title="No products in this auction" description="This auction does not have any active products yet." />
              ) : (
                <div className="space-y-3">
                  {products.map((product) => {
                    const currentHighest = productBids[product.id]?.highest_bid ?? 0;
                    const registered = registeredAuctions.has(selectedAuction.id);
                    const isEnded = (timeLeft[selectedAuction.id] ?? 0) <= 0;

                    return (
                      <div key={product.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-brand-200 hover:bg-white">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="truncate font-semibold text-slate-900">{product.name}</h4>
                            <p className="mt-1 text-xs text-slate-500">ID: {product.id}</p>
                            {product.description ? <p className="mt-2 text-sm leading-6 text-slate-600">{product.description}</p> : null}
                          </div>
                          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${product.status === 'sold' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {product.status === 'sold' ? 'Sold' : 'Available'}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                          <div className="text-sm text-slate-600">
                            <span className="font-medium text-slate-900">Highest bid:</span> ₹{currentHighest.toLocaleString()}
                          </div>

                          {registered ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowBidModal(true);
                              }}
                              disabled={product.status === 'sold' || isEnded}
                            >
                              Place Bid
                            </Button>
                          ) : (
                            <span className="text-xs font-medium text-slate-500">Register to bid</span>
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

      <Modal
        isOpen={showBidModal}
        onClose={() => {
          setShowBidModal(false);
          setBidAmount('');
          setSelectedProduct(null);
        }}
        title={`Place Bid on ${selectedProduct?.name ?? 'Product'}`}
      >
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="font-semibold text-slate-900">{selectedProduct?.name}</h4>
            <p className="mt-1 text-sm text-slate-500">ID: {selectedProduct?.id}</p>
            <p className="mt-3 text-sm text-slate-600">
              Current highest bid: <span className="font-semibold text-slate-900">₹{selectedProduct ? (productBids[selectedProduct.id]?.highest_bid ?? 0).toLocaleString() : '0'}</span>
            </p>
          </div>

          <Input
            label="Your bid amount"
            type="number"
            value={bidAmount}
            onChange={(event) => setBidAmount(event.target.value)}
            placeholder="Enter bid amount"
            min={selectedProduct ? (productBids[selectedProduct.id]?.highest_bid ?? 0) + 1 : 1}
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowBidModal(false);
                setBidAmount('');
                setSelectedProduct(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handlePlaceBid} loading={bidLoading} className="flex-1">
              Place Bid
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

const EmptyState: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <Gavel className="h-6 w-6" />
    </div>
    <h4 className="mt-4 text-base font-semibold text-slate-900">{title}</h4>
    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
  </div>
);

const Loader = () => (
  <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-12">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
  </div>
);

const getSecondsLeft = (iso: string) => Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));

const formatTimeLeft = (seconds: number) => {
  if (seconds <= 0) return 'Ended';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days) return `${days}d ${hours}h ${minutes}m`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};
