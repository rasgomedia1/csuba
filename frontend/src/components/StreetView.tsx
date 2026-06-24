import React, { useEffect, useRef } from 'react';

interface StreetViewProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export const StreetView: React.FC<StreetViewProps> = ({ latitude, longitude, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Street View
    const streetView = new (window as any).google.maps.StreetViewPanorama(containerRef.current, {
      position: { lat: latitude, lng: longitude },
      pov: {
        heading: 0,
        pitch: 0,
      },
      zoom: 1,
      motionTrackingControl: true,
      controlSize: 30,
      disableDefaultUI: false,
    });

    return () => {
      // Cleanup if needed
    };
  }, [latitude, longitude]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ aspectRatio: '16 / 9' }}
    />
  );
};
