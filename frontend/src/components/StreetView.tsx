import React, { useState } from 'react';
import content from '../content.json';

interface StreetViewProps {
  latitude: number;
  longitude: number;
  className?: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

// Street View Static image, falling back to a Static Maps pin if there is no
// panorama. Renders nothing when no Maps key is configured.
export const StreetView: React.FC<StreetViewProps> = ({ latitude, longitude, className = '' }) => {
  const [failed, setFailed] = useState(false);
  if (!API_KEY) return null;

  const loc = `${latitude},${longitude}`;
  const src = failed
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${loc}&zoom=16&size=800x450&markers=color:red%7C${loc}&key=${API_KEY}`
    : `https://maps.googleapis.com/maps/api/streetview?size=800x450&location=${loc}&heading=0&pitch=0&fov=90&return_error_code=true&key=${API_KEY}`;

  return (
    <div className={`w-full ${className}`} style={{ aspectRatio: '16 / 9' }}>
      <img
        src={src}
        alt={content.common.streetViewAlt}
        loading="lazy"
        className="w-full h-full object-cover rounded-lg"
        onError={() => !failed && setFailed(true)}
      />
    </div>
  );
};
