import React from 'react';
import { Link } from 'react-router-dom';
import content from '../content.json';

interface Auction {
  id: string;
  external_id?: string;
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

const formatPrice = (price: number): string => {
  const rounded = Math.round(price);
  return '€ ' + rounded.toLocaleString('en-US', { style: 'decimal' })
    .replace(/,/g, '.');
};

// Label-left field: title always to the left of the value, single tight line.
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="leading-tight">
    <span className="text-gray-600">{label} </span>
    <span className="font-semibold">{children}</span>
  </div>
);

export const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  onAddToWatchlist,
  isInWatchlist
}) => {
  const basisPrice = auction.valor_tasacion_eur || auction.price_initial;
  const pricePerM2 = auction.property_constructed_sqm && basisPrice
    ? Math.round(basisPrice / auction.property_constructed_sqm)
    : null;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex flex-col relative">
        {onAddToWatchlist && (
          <button
            onClick={() => onAddToWatchlist(auction.id)}
            className="absolute top-2 right-2 text-xl z-10 hover:scale-110 transition-transform"
            title={isInWatchlist ? content.common.removeFavorite : content.common.addFavorite}
          >
            {isInWatchlist ? '❤️' : '🤍'}
          </button>
        )}

        <div className="p-3 leading-tight">
          <Field label={content.auctionCard.idLabel}>
            <span className="font-mono text-brand-600">{auction.external_id || auction.id.substring(0, 8)}</span>
          </Field>

          {/* Tasación — main figure */}
          {auction.valor_tasacion_eur ? (
            <div className="mt-2 mb-2 p-2 bg-blue-50 border border-blue-200 rounded leading-tight">
              <p className="text-xs text-gray-600">{content.auctionCard.tasacion}</p>
              <p className="text-2xl font-bold text-brand-600">{formatPrice(auction.valor_tasacion_eur)}</p>
              {pricePerM2 && (
                <Field label={content.auctionCard.priceM2}>{formatPrice(pricePerM2)}</Field>
              )}
              {auction.minimum_bid_eur !== undefined && (
                <Field label={content.auctionCard.pujaMinima}>{formatPrice(auction.minimum_bid_eur)}</Field>
              )}
              {auction.importe_deposito_eur !== undefined && (
                <Field label={content.auctionCard.deposito}>{formatPrice(auction.importe_deposito_eur)}</Field>
              )}
            </div>
          ) : (
            <div className="mt-2 mb-2 leading-tight">
              <p className="text-2xl font-bold text-brand-600">{formatPrice(auction.price_initial)}</p>
              {pricePerM2 && <Field label={content.auctionCard.priceM2}>{formatPrice(pricePerM2)}</Field>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-sm mb-2">
            <Field label={content.auctionCard.location}>
              {auction.gps_latitude && auction.gps_longitude ? (
                <a
                  href={`https://www.google.com/maps/?q=${auction.gps_latitude},${auction.gps_longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 underline"
                >
                  {auction.province}
                </a>
              ) : (
                auction.province
              )}
            </Field>
            <Field label={content.auctionCard.type}>{auction.property_type}</Field>
            {auction.property_constructed_sqm && (
              <Field label={content.auctionCard.area}>{auction.property_constructed_sqm} m2</Field>
            )}
            {auction.property_year_catastro && (
              <Field label={content.auctionCard.built}>{auction.property_year_catastro}</Field>
            )}
            {auction.auction_end && (
              <div className="leading-tight">
                <span className="text-gray-600">{content.auctionCard.fechaCierre} </span>
                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                  {new Date(auction.auction_end).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </div>

          {auction.investment_score && (
            <div className="mb-2">
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                {content.auctionCard.scorePrefix} {auction.investment_score}
              </span>
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded p-2 mb-2 h-20 overflow-y-auto text-xs text-gray-900">
            <p className="whitespace-pre-wrap leading-snug">
              {auction.description || content.auctionCard.noDescription}
            </p>
          </div>

          <Link
            to={`/auctions/${auction.id}`}
            className="px-3 py-1.5 bg-brand-600 text-white rounded hover:bg-brand-700 text-center font-semibold text-sm block"
          >
            {content.auctionCard.viewDetails}
          </Link>
        </div>

        {auction.gps_latitude && auction.gps_longitude && (
          <div className="bg-gray-50 border-t">
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
