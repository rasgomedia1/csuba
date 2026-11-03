import React, { useState } from "react";
import content from "../content.json";
import { mapEmbedUrl } from "../utils/maps";

interface StreetViewProps {
  latitude: number;
  longitude: number;
  className?: string;
}

// Maps Embed API key (free, unlimited). Restricted in Google Cloud to the
// Maps Embed API and to csuba.vercel.app / localhost referrers.
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

// Interactive Street View panorama of the location, shown as soon as the
// auction opens. A toggle switches to the keyless satellite map (useful where
// Google has no street imagery); without a key only the satellite map shows.
export const StreetView: React.FC<StreetViewProps> = ({
  latitude,
  longitude,
  className = "",
}) => {
  const [mode, setMode] = useState<"street" | "satellite">(
    API_KEY ? "street" : "satellite",
  );
  const src =
    mode === "street"
      ? `https://www.google.com/maps/embed/v1/streetview?key=${API_KEY}&location=${latitude},${longitude}&heading=0&pitch=0&fov=90`
      : mapEmbedUrl(latitude, longitude, true);

  return (
    <div className={className}>
      <div
        className="relative w-full bg-gray-200"
        style={{ aspectRatio: "16 / 9" }}
      >
        <iframe
          key={mode}
          className="absolute inset-0 w-full h-full border-0"
          src={src}
          title={content.common.streetViewAlt}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      {/* Toggle sits below the frame: Google draws its own controls on top */}
      {API_KEY && (
        <div className="flex text-xs font-semibold border-t border-gray-200">
          {(["street", "satellite"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`flex-1 py-2 ${mode === m ? "bg-brand-600 text-white" : "bg-white text-gray-800"}`}
            >
              {m === "street"
                ? content.common.viewStreet
                : content.common.viewSatellite}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
