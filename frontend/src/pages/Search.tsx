import React, { useState, useEffect } from 'react';
import { SearchFilters, FilterState } from '../components/SearchFilters';
import { AuctionCard } from '../components/AuctionCard';
import { auctionsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Auction {
  id: string;
  title: string;
  price_initial: number;
  price_estimate?: number;
  province: string;
  property_type: string;
  auction_status: string;
  occupancy_status: string;
  risk_score_overall: number;
  auction_end: string;
}

export const Search: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  const loadWatchlist = async () => {
    if (!user) return;
    try {
      const response = await auctionsAPI.getWatchlist();
      const ids = new Set(response.data.watchlist?.map((a: any) => a.id) || []);
      setWatchlist(ids);
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, [user]);

  const handleFilter = async (filters: FilterState) => {
    setLoading(true);
    setError(null);

    try {
      const response = await auctionsAPI.search({
        ...filters,
        limit: 50
      });

      setAuctions(response.data.auctions || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al buscar subastas');
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (auctionId: string) => {
    if (!user) {
      alert('Debes iniciar sesión para guardar subastas');
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
      alert('Error al actualizar lista de guardados');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Buscar Subastas</h1>

      <SearchFilters onFilter={handleFilter} />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">⏳</div>
          <p className="mt-4 text-gray-600">Buscando subastas...</p>
        </div>
      )}

      {!loading && auctions.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">
            👀 No se encontraron subastas. Intenta ajustar tus filtros.
          </p>
        </div>
      )}

      {!loading && auctions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="mt-8 text-center text-gray-600">
          <p>Se encontraron {auctions.length} subastas</p>
        </div>
      )}
    </div>
  );
};
