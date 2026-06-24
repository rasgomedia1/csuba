import React from 'react';

interface StreetViewProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export const StreetView: React.FC<StreetViewProps> = ({ latitude, longitude, className = '' }) => {
  // Static Street View image from Google Maps API
  const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=800x450&location=${latitude},${longitude}&heading=0&pitch=0&key=AIzaSyBMQXNJL5iRWnM6XiMhUzKBqPvSmD1Pk-s`;

  return (
    <div className={`w-full ${className}`} style={{ aspectRatio: '16 / 9' }}>
      <img
        src={streetViewUrl}
        alt="Street View"
        className="w-full h-full object-cover rounded-lg"
        onError={(e) => {
          // Fallback: show placeholder if Street View not available
          e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect fill='%23ddd' width='800' height='450'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='24'%3EStreet View no disponible%3C/text%3E%3C/svg%3E`;
        }}
      />
    </div>
  );
};
