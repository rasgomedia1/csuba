import React from 'react';

interface StreetViewProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export const StreetView: React.FC<StreetViewProps> = ({ latitude, longitude, className = '' }) => {
  // Static Maps image - no API key required for basic usage
  const mapsImageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=16&size=800x450&markers=color:red%7C${latitude},${longitude}&style=feature:all|element:labels|visibility:off`;

  return (
    <div className={`w-full ${className}`} style={{ aspectRatio: '16 / 9' }}>
      <img
        src={mapsImageUrl}
        alt="Ubicación en mapa"
        className="w-full h-full object-cover rounded-lg"
        loading="lazy"
      />
    </div>
  );
};
