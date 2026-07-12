import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auctionsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { StreetView } from '../components/StreetView';

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
  url: string;
  investment_score?: string;
  investment_score_description?: string;
  legal_charges_description?: string;
  external_id?: string;
  details?: {
    gps_latitude?: number;
    gps_longitude?: number;
    cadastre_address?: string;
  };
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
          <div className="bg-white rounded-lg shadow p-8 relative">
            {/* Heart/Favorite Button */}
            <button
              onClick={handleWatchlist}
              className="absolute top-4 right-4 text-3xl z-10 hover:scale-110 transition-transform"
              title={inWatchlist ? 'Remove from favorites' : 'Add to favorites'}
            >
              {inWatchlist ? '❤️' : '🤍'}
            </button>

            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">{auction.external_id || id}</h1>
                {auction.description && (
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{auction.description}</p>
                )}
              </div>
            </div>

            {/* Street View Section */}
            {auction.details?.gps_latitude && auction.details?.gps_longitude && (
              <div className="mb-8 flex justify-center">
                <div className="w-1/2">
                  <h2 className="text-xl font-semibold mb-4">📍 Ubicación</h2>
                  <div className="rounded-lg overflow-hidden shadow-md">
                    <StreetView
                      latitude={auction.details.gps_latitude}
                      longitude={auction.details.gps_longitude}
                    />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <p className="text-xs text-gray-500 mb-2">GPS: {auction.details.gps_latitude}, {auction.details.gps_longitude}</p>
                    <a
                      href={`https://www.google.com/maps/@${auction.details.gps_latitude},${auction.details.gps_longitude},16z/data=!5m1!1e1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 text-center"
                    >
                      🗺️ Map
                    </a>
                    <a
                      href={`https://www.google.com/maps/@${auction.details.gps_latitude},${auction.details.gps_longitude},16z/data=!5m1!1e3`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 text-center"
                    >
                      🛰️ Satellite
                    </a>
                  </div>
                  {auction.details?.cadastre_address && (
                    <p className="text-sm text-gray-600 mt-3">📮 {auction.details.cadastre_address}</p>
                  )}
                </div>
              </div>
            )}

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

            {/* Investment Score Section */}
            {(auction.investment_score || auction.investment_score_description) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  {auction.investment_score && (
                    <div>
                      <p className="text-gray-600 text-sm">📊 Score de Inversión</p>
                      <p className="text-lg font-bold text-gray-900">{auction.investment_score}</p>
                    </div>
                  )}
                  {auction.investment_score_description && (
                    <div>
                      <p className="text-gray-600 text-sm">📝 Descripción</p>
                      <p className="text-base font-semibold text-gray-900">{auction.investment_score_description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Legal Charges Section */}
            {auction.legal_charges_description && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-gray-600 text-sm">⚠️ Cargas Legales</p>
                  <p className="text-base font-semibold text-gray-900 mt-2">{auction.legal_charges_description}</p>
                </div>
              </div>
            )}
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
