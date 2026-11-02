import React, { useState } from 'react';
import content from '../content.json';
import { mapEmbedUrl } from '../utils/maps';

interface StreetViewProps {
  latitude: number;
  longitude: number;
  className?: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

// Street View Static photo of the location. If there is no key, no panorama,
// or Google rejects the key (e.g. billing disabled → 403), it falls back to a
// keyless embedded satellite map so the location is always visible.
export const StreetView: React.FC<StreetViewProps> = ({ latitude, longitude, className = '' }) => {
  const [failed, setFailed] = useState(!API_KEY);
  const loc = `${latitude},${longitude}`;

  return (
    <div className={`relative w-full bg-gray-200 ${className}`} style={{ aspectRatio: '16 / 9' }}>
      {failed ? (
        <iframe
          className="absolute inset-0 w-full h-full border-0"
          src={mapEmbedUrl(latitude, longitude, true)}
          title={content.common.streetViewAlt}
          loading="lazy"
          allowFullScreen
        />
      ) : (
        <img
          src={`https://maps.googleapis.com/maps/api/streetview?size=800x450&location=${loc}&fov=90&return_error_code=true&key=${API_KEY}`}
          alt={content.common.streetViewAlt}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
};
