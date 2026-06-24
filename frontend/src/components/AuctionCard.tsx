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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Left section - Information */}
        <div className="p-6">
          <Link
            to={`/auctions/${auction.id}`}
            className="text-lg font-semibold text-brand-600 hover:text-brand-700 block mb-4"
          >
            {auction.title}
          </Link>

          <div className="mb-6">
            <p className="text-3xl font-bold text-brand-600">
              {formatPrice(auction.price_initial)}
            </p>
            {pricePerM2 && (
              <p className="text-sm text-gray-600">Price m2 {formatPrice(pricePerM2)}</p>
            )}
          </div>

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
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                {new Date(auction.auction_end).toLocaleDateString('en-US')}
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <Link
              to={`/auctions/${auction.id}`}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 text-center font-semibold text-sm"
            >
              View Details
            </Link>
            {onAddToWatchlist && (
              <button
                onClick={() => onAddToWatchlist(auction.id)}
                className={`flex-1 px-4 py-2 rounded font-semibold text-sm ${
                  isInWatchlist
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {isInWatchlist ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>

        {/* Right section - Map Preview */}
        {auction.gps_latitude && auction.gps_longitude ? (
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
        ) : null}
      </div>
    </div>
  );
};
