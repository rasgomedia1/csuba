import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface AuctionDetail {
  id: string;
  title: string;
  description: string;
  price_initial: number;
  price_estimate: number;
  price_final?: number;
  province: string;
  municipality: string;
  property_type: string;
  auction_status: string;
  occupancy_status: string;
  auction_start: string;
  auction_end: string;
  risk_score_overall: number;
  risk_score_legal: number;
  risk_score_occupancy: number;
  risk_score_market: number;
  risk_factors: string[];
  url: string;
  details?: any;
  priceHistory?: any[];
}

export const AuctionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auction, setAuction] = useState<AuctionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    loadAuction();
  }, [id]);

  const loadAuction = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await auctionsAPI.getById(id);
      setAuction(response.data);

      if (user) {
        const watchlistResponse = await auctionsAPI.getWatchlist();
        const isInWatchlist = watchlistResponse.data.watchlist?.some((a: any) => a.id === id);
        setInWatchlist(!!isInWatchlist);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar la subasta');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!id) return;

    try {
      if (inWatchlist) {
        await auctionsAPI.removeFromWatchlist(id);
        setInWatchlist(false);
      } else {
        await auctionsAPI.addToWatchlist(id);
        setInWatchlist(true);
      }
    } catch {
      alert('Error al actualizar lista de guardados');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin text-2xl">⏳</div>
          <p className="mt-4 text-gray-600">Cargando detalles de la subasta...</p>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'No se encontró la subasta'}
        </div>
        <button
          onClick={() => navigate('/search')}
          className="mt-4 px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700"
        >
          Volver a búsqueda
        </button>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score < 20) return 'bg-green-100 text-green-800';
    if (score < 50) return 'bg-yellow-100 text-yellow-800';
    if (score < 75) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/search')}
        className="mb-6 text-brand-600 hover:text-brand-700 font-semibold"
      >
        ← Volver a búsqueda
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold">{auction.title}</h1>
              <button
                onClick={handleWatchlist}
                className={`px-4 py-2 rounded font-semibold ${
                  inWatchlist
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {inWatchlist ? '❤️ Guardada' : '🤍 Guardar'}
              </button>
            </div>

            {/* Description */}
            {auction.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">📝 Descripción</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{auction.description}</p>
              </div>
            )}

            {/* Risk Scores */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">⚠️ Análisis de Riesgo</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded text-center ${getRiskColor(auction.risk_score_overall)}`}>
                  <div className="text-3xl font-bold">{auction.risk_score_overall}</div>
                  <p className="text-sm">Riesgo General</p>
                </div>
                <div className={`p-4 rounded text-center ${getRiskColor(auction.risk_score_legal)}`}>
                  <div className="text-3xl font-bold">{auction.risk_score_legal}</div>
                  <p className="text-sm">Legal</p>
                </div>
                <div className={`p-4 rounded text-center ${getRiskColor(auction.risk_score_occupancy)}`}>
                  <div className="text-3xl font-bold">{auction.risk_score_occupancy}</div>
                  <p className="text-sm">Ocupación</p>
                </div>
                <div className={`p-4 rounded text-center ${getRiskColor(auction.risk_score_market)}`}>
                  <div className="text-3xl font-bold">{auction.risk_score_market}</div>
                  <p className="text-sm">Mercado</p>
                </div>
              </div>

              {auction.risk_factors && auction.risk_factors.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Factores de Riesgo:</h3>
                  <ul className="space-y-2">
                    {auction.risk_factors.map((factor, idx) => (
                      <li key={idx} className="flex gap-2 text-gray-700">
                        <span>•</span> {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm">📍 Provincia</p>
                <p className="text-lg font-semibold">{auction.province}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">🏙️ Municipio</p>
                <p className="text-lg font-semibold">{auction.municipality}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">🏠 Tipo</p>
                <p className="text-lg font-semibold">{auction.property_type}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">💰 Precio Inicial</p>
                <p className="text-lg font-semibold text-brand-600">
                  €{auction.price_initial?.toLocaleString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">💎 Estimado</p>
                <p className="text-lg font-semibold">
                  €{auction.price_estimate?.toLocaleString('es-ES')}
                </p>
              </div>
              {auction.price_final && (
                <div>
                  <p className="text-gray-600 text-sm">✅ Precio Final</p>
                  <p className="text-lg font-semibold text-green-600">
                    €{auction.price_final?.toLocaleString('es-ES')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Estado de la Subasta</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-semibold text-lg">
                  {auction.auction_status === 'active' && '🔴 Activa'}
                  {auction.auction_status === 'completed' && '✅ Completada'}
                  {auction.auction_status === 'deserted' && '❌ Desierta'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ocupación</p>
                <p className="font-semibold">
                  {auction.occupancy_status === 'occupied' && '👥 Ocupada'}
                  {auction.occupancy_status === 'empty' && '🏚️ Vacía'}
                  {auction.occupancy_status === 'unknown' && '❓ Desconocido'}
                </p>
              </div>
            </div>
          </div>

          {/* Dates Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">📅 Fechas</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Inicio</p>
                <p className="font-semibold">
                  {new Date(auction.auction_start).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Finalización</p>
                <p className="font-semibold">
                  {new Date(auction.auction_end).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* External Link */}
          {auction.url && (
            <a
              href={auction.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 text-center"
            >
              🔗 Ver en BOE
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
