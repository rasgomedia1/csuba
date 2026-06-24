import React from 'react';

interface StreetViewProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export const StreetView: React.FC<StreetViewProps> = ({ latitude, longitude, className = '' }) => {
  // Street View Static image from Google Maps API
  const apiKey = 'AIzaSyAumR7yrs4BLDT-qJuO1JLtX36_zvTC6Tw';
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x450&location=${latitude},${longitude}&heading=0&pitch=0&fov=90&key=${apiKey}`;

  return (
    <div className={`w-full ${className}`} style={{ aspectRatio: '16 / 9' }}>
      <img
        src={streetViewUrl}
        alt="Street View"
        className="w-full h-full object-cover rounded-lg"
        onError={(e) => {
          console.error('Street View error:', e);
          // Fallback a Static Maps
          const fallbackUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=16&size=800x450&markers=color:red%7C${latitude},${longitude}&key=${apiKey}`;
          e.currentTarget.src = fallbackUrl;
        }}
      />
    </div>
  );
};
