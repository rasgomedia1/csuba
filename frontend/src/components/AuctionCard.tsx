import React from 'react';
import { Link } from 'react-router-dom';

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
  investment_score?: string;
  auction_end: string;
  url?: string;
  // Catastro fields
  property_constructed_sqm?: number;
  property_year_catastro?: number;
  gps_latitude?: number;
  gps_longitude?: number;
}

interface AuctionCardProps {
  auction: Auction;
  onAddToWatchlist?: (id: string) => void;
  isInWatchlist?: boolean;
}

const getRiskColor = (score: number): string => {
  if (score < 20) return 'bg-green-100 text-green-800';
  if (score < 50) return 'bg-yellow-100 text-yellow-800';
  if (score < 75) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
};

const getRiskLabel = (score: number): string => {
  if (score < 20) return '✓ Bajo';
  if (score < 50) return '⚠️ Moderado';
  if (score < 75) return '⚠️⚠️ Alto';
  return '❌ Muy Alto';
};

const getStatusBadge = (status: string): string => {
  switch (status) {
    case 'active':
      return '🔴 Activa';
    case 'completed':
      return '✅ Completada';
    case 'deserted':
      return '❌ Desierta';
    default:
      return status;
  }
};

export const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  onAddToWatchlist,
  isInWatchlist
}) => {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <Link
            to={`/auctions/${auction.id}`}
            className="text-lg font-semibold text-brand-600 hover:text-brand-700 flex-1"
          >
            {auction.title}
          </Link>
          <span className={`px-3 py-1 rounded text-sm font-semibold ${getRiskColor(auction.risk_score_overall || 0)}`}>
            {getRiskLabel(auction.risk_score_overall || 0)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <span className="text-gray-600">💰 Precio</span>
            <p className="font-semibold text-brand-600">
              €{auction.price_initial?.toLocaleString('es-ES') || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">📍 {auction.province}</span>
            <p className="font-semibold">{auction.property_type}</p>
          </div>
          {auction.property_constructed_sqm && (
            <div>
              <span className="text-gray-600">📐 Superficie</span>
              <p className="font-semibold">{auction.property_constructed_sqm} m²</p>
            </div>
          )}
          {auction.property_year_catastro && (
            <div>
              <span className="text-gray-600">🏗️ Año Construcción</span>
              <p className="font-semibold">{auction.property_year_catastro}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {getStatusBadge(auction.auction_status)}
          </span>
          {auction.investment_score && (
            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded font-semibold">
              💎 {auction.investment_score}
            </span>
          )}
          {auction.auction_end && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
              📅 {new Date(auction.auction_end).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <Link
            to={`/auctions/${auction.id}`}
            className="flex-1 px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 text-center font-semibold"
          >
            Ver Detalles
          </Link>
          {onAddToWatchlist && (
            <button
              onClick={() => onAddToWatchlist(auction.id)}
              className={`flex-1 px-4 py-2 rounded font-semibold ${
                isInWatchlist
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isInWatchlist ? '❤️ Guardada' : '🤍 Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
