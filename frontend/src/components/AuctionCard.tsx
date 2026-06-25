import React from 'react';
import { Link } from 'react-router-dom';
import { SectionNumber } from './SectionNumber';

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
  url?: string;
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

const getStatusBadge = (status: string): string => {
  const status_lower = status.toLowerCase();
  if (status_lower === 'activa') return 'Active';
  if (status_lower === 'completada') return 'Completed';
  if (status_lower === 'desierta') return 'Deserted';
  return status;
};

const formatPrice = (price: number): string => {
  const rounded = Math.round(price);
  return '€ ' + rounded.toLocaleString('en-US', { style: 'decimal' })
    .replace(/,/g, '.');
};

export const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  onAddToWatchlist,
  isInWatchlist
}) => {
  const pricePerM2 = auction.property_constructed_sqm
    ? Math.round(auction.price_initial / auction.property_constructed_sqm)
    : null;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex flex-col relative">
        {/* Heart/Favorite Button */}
        {onAddToWatchlist && (
          <button
            onClick={() => onAddToWatchlist(auction.id)}
            className="absolute top-3 right-3 text-2xl z-10 hover:scale-110 transition-transform"
            title={isInWatchlist ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isInWatchlist ? '❤️' : '🤍'}
          </button>
        )}

        {/* Top section - Information */}
        <div className="p-6 relative">
          <SectionNumber number={1} />
          <p className="text-sm text-gray-600 mb-4">
            ID: <span className="font-mono font-semibold text-brand-600">{auction.external_id || auction.id.substring(0, 8)}</span>
          </p>

          <div className="mb-6">
            <p className="text-3xl font-bold text-brand-600">
              {formatPrice(auction.price_initial)}
            </p>
            {pricePerM2 && (
              <p className="text-sm text-gray-600">Price m2 {formatPrice(pricePerM2)}</p>
            )}
          </div>

          {/* Minimum Bid Section - Main */}
          {auction.minimum_bid_eur && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-gray-600 mb-1">🏷️ Puja Mínima</p>
              <p className="text-2xl font-bold text-brand-600">{formatPrice(auction.minimum_bid_eur)}</p>
              {auction.valor_tasacion_eur && (
                <p className="text-base text-gray-700 mt-2">
                  💎 Tasación: <span className="font-semibold">{formatPrice(auction.valor_tasacion_eur)}</span>
                </p>
              )}
              {auction.importe_deposito_eur && (
                <p className="text-base text-gray-700 mt-1">
                  🏦 Depósito: <span className="font-semibold">{formatPrice(auction.importe_deposito_eur)}</span>
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-600">Location &nbsp;</span>
              {auction.gps_latitude && auction.gps_longitude ? (
                <a
                  href={`https://www.google.com/maps/?q=${auction.gps_latitude},${auction.gps_longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-600 hover:text-brand-700 underline"
                >
                  {auction.province}
                </a>
              ) : (
                <p className="font-semibold">{auction.province}</p>
              )}
            </div>
            <div>
              <span className="text-gray-600">Type</span>
              <p className="font-semibold">{auction.property_type}</p>
            </div>
            {auction.property_constructed_sqm && (
              <div>
                <span className="text-gray-600">Area</span>
                <p className="font-semibold">{auction.property_constructed_sqm} m2</p>
              </div>
            )}
            {auction.property_year_catastro && (
              <div>
                <span className="text-gray-600">Built</span>
                <p className="font-semibold">{auction.property_year_catastro}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-4 flex-wrap text-xs">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
              {getStatusBadge(auction.auction_status)}
            </span>
            {auction.investment_score && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-semibold">
                Score: {auction.investment_score}
              </span>
            )}
            {auction.auction_end && (
              <div className="text-xs space-y-1">
                <p className="text-gray-600">📅 Fecha Cierre</p>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                  {new Date(auction.auction_end).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </div>

          {/* Description Box - Fixed Height */}
          <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4 h-32 overflow-y-auto text-sm text-gray-900">
            <p className="whitespace-pre-wrap leading-relaxed">
              {auction.description || 'No description available'}
            </p>
          </div>

          <Link
            to={`/auctions/${auction.id}`}
            className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 text-center font-semibold text-sm block"
          >
            View Details
          </Link>
        </div>

        {/* Bottom section - Map Preview */}
        {auction.gps_latitude && auction.gps_longitude && (
          <div className="bg-gray-50 border-t relative">
            <SectionNumber number={2} />
            <div className="relative overflow-hidden bg-gray-200" style={{ aspectRatio: '16 / 9' }}>
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                src={`https://www.google.com/maps?q=${auction.gps_latitude},${auction.gps_longitude}&output=embed&z=15`}
                allowFullScreen={true}
                loading="lazy"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
