import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auctionsAPI } from '../services/api';
import { AuctionCard } from '../components/AuctionCard';

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

export const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      const response = await auctionsAPI.getWatchlist();
      setWatchlist(response.data.watchlist || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar lista de guardados');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (auctionId: string) => {
    try {
      await auctionsAPI.removeFromWatchlist(auctionId);
      setWatchlist((prev) => prev.filter((a) => a.id !== auctionId));
    } catch (err: any) {
      // 401 is handled globally by the API interceptor (session expired → redirect).
      if (err.response?.status !== 401) {
        alert('Error al remover de lista de guardados');
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="mt-4 text-gray-600">Cargando lista de guardados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">❤️ Mi Lista de Subastas</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {watchlist.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">
            🤍 No tienes subastas guardadas
          </p>
          <button
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-brand-600 text-white rounded font-semibold hover:bg-brand-700"
          >
            🔍 Ir a Buscar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              onAddToWatchlist={() => handleRemove(auction.id)}
              isInWatchlist={true}
            />
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-gray-600">
        <p>{watchlist.length} subasta{watchlist.length !== 1 ? 's' : ''} guardada{watchlist.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
};
