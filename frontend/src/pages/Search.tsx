import React, { useState, useEffect, useMemo } from 'react';
import { SearchFilters, ApifyFilterState, LocalFilterState } from '../components/SearchFilters';
import { AuctionCard } from '../components/AuctionCard';
import { auctionsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import content from '../content.json';

interface Auction {
  id: string;
  title: string;
  description?: string;
  price_initial: number;
  price_estimate?: number;
  minimum_bid_eur?: number;
  valor_tasacion_eur?: number;
  importe_deposito_eur?: number;
  province: string;
  property_type: string;
  auction_status: string;
  occupancy_status: string;
  investment_score?: string;
  auction_end: string;
  property_constructed_sqm?: number;
}

const defaultApifyFilters: ApifyFilterState = {
  tipoBien: 'inmueble',
  province: 'Castellón',
  minimumBidMax: 1000,
  investmentScore: 'MUY_ALTO',
  maxResultados: 10
};

const defaultLocalFilters: LocalFilterState = {
  sortBy: 'tasacion'
};

const applyLocalFilters = (auctions: Auction[], filters: LocalFilterState): Auction[] => {
  let result = auctions.filter((a) => {
    if (filters.propertyType && a.property_type !== filters.propertyType) return false;
    if (filters.areaMin !== undefined && (!a.property_constructed_sqm || a.property_constructed_sqm < filters.areaMin)) return false;
    if (filters.minimumBidMin !== undefined && (a.minimum_bid_eur ?? 0) < filters.minimumBidMin) return false;
    if (filters.maxTasacion !== undefined && (a.valor_tasacion_eur ?? Infinity) > filters.maxTasacion) return false;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      const haystack = `${a.title} ${a.description || ''} ${a.province}`.toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    return true;
  });

  // Numeric fields (valor_tasacion_eur, minimum_bid_eur, etc.) arrive from the
  // API as strings (Postgres DECIMAL serialization), so every numeric key must
  // be coerced with Number() explicitly rather than relying on typeof checks.
  const numericSortKey: Record<string, (a: Auction) => number> = {
    tasacion: (a: Auction) => Number(a.valor_tasacion_eur) || 0,
    date: (a: Auction) => new Date(a.auction_end).getTime() || 0,
    pricePerM2: (a: Auction) => (a.property_constructed_sqm ? (Number(a.valor_tasacion_eur) || Number(a.price_initial) || 0) / a.property_constructed_sqm : 0),
    auctionEnd: (a: Auction) => new Date(a.auction_end).getTime() || 0,
    minimumBid: (a: Auction) => Number(a.minimum_bid_eur) || 0,
    depositAmount: (a: Auction) => Number(a.importe_deposito_eur) || 0
  };

  if (filters.sortBy === 'investmentScore') {
    result = [...result].sort((a, b) => (b.investment_score || '').localeCompare(a.investment_score || ''));
  } else {
    const getKey = numericSortKey[filters.sortBy];
    if (getKey) {
      result = [...result].sort((a, b) => getKey(b) - getKey(a));
    }
  }

  return result;
};

export const Search: React.FC = () => {
  const [rawAuctions, setRawAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const [initialApifyFilters, setInitialApifyFilters] = useState<ApifyFilterState | undefined>(undefined);
  const [initialLocalFilters, setInitialLocalFilters] = useState<LocalFilterState | undefined>(undefined);
  const [localFilters, setLocalFilters] = useState<LocalFilterState>(defaultLocalFilters);
  const { user } = useAuth();

  const loadWatchlist = async () => {
    if (!user) return;
    try {
      const response = await auctionsAPI.getWatchlist();
      const ids = new Set<string>(response.data.watchlist?.map((a: any) => a.id) || []);
      setWatchlist(ids);
    } catch {
      // Silently fail
    }
  };

  const runApifySearch = async (filters: ApifyFilterState) => {
    localStorage.setItem('lastApifyFilters', JSON.stringify(filters));

    setLoading(true);
    setError(null);

    try {
      const response = await auctionsAPI.search(filters);
      setRawAuctions(response.data.auctions || []);
    } catch (err: any) {
      setError(err.response?.data?.error || content.search.errorFallback);
      setRawAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();

    const savedApify = localStorage.getItem('lastApifyFilters');
    const savedLocal = localStorage.getItem('lastLocalFilters');

    const apifyFilters = savedApify ? JSON.parse(savedApify) : defaultApifyFilters;
    const localFiltersInit = savedLocal ? JSON.parse(savedLocal) : defaultLocalFilters;

    setInitialApifyFilters(apifyFilters);
    setInitialLocalFilters(localFiltersInit);
    setLocalFilters(localFiltersInit);

    runApifySearch(apifyFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLocalFilter = (filters: LocalFilterState) => {
    localStorage.setItem('lastLocalFilters', JSON.stringify(filters));
    setLocalFilters(filters);
  };

  const auctions = useMemo(() => applyLocalFilters(rawAuctions, localFilters), [rawAuctions, localFilters]);

  const handleAddToWatchlist = async (auctionId: string) => {
    if (!user) {
      alert(content.search.loginRequired);
      return;
    }

    try {
      if (watchlist.has(auctionId)) {
        await auctionsAPI.removeFromWatchlist(auctionId);
        setWatchlist((prev) => {
          const newSet = new Set(prev);
          newSet.delete(auctionId);
          return newSet;
        });
      } else {
        await auctionsAPI.addToWatchlist(auctionId);
        setWatchlist((prev) => new Set(prev).add(auctionId));
      }
    } catch (err: any) {
      // 401 is handled globally by the API interceptor (session expired → redirect).
      if (err.response?.status !== 401) {
        alert(content.search.watchlistError);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <h1 className="text-xl font-bold mb-3">{content.search.title}</h1>

      <div className="mb-4">
        <SearchFilters
          onApifyFilter={runApifySearch}
          onLocalFilter={handleLocalFilter}
          initialApifyFilters={initialApifyFilters}
          initialLocalFilters={initialLocalFilters}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-2 text-gray-600">{content.search.loading}</p>
        </div>
      )}

      {!loading && auctions.length === 0 && !error && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {content.search.empty}
          </p>
        </div>
      )}

      {!loading && auctions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              onAddToWatchlist={handleAddToWatchlist}
              isInWatchlist={watchlist.has(auction.id)}
            />
          ))}
        </div>
      )}

      {!loading && auctions.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>{content.search.resultsCount.replace('{count}', String(auctions.length))}</p>
        </div>
      )}
    </div>
  );
};
