// Keyless Google Maps URLs (official "Maps URLs" + classic embed), so the
// location still shows when the Maps Platform key is missing or rejected.
export const mapEmbedUrl = (lat: number | string, lng: number | string, satellite = false) =>
  `https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed${satellite ? '&t=k' : ''}`;

// Opens interactive Street View (Google Maps app on Android, browser elsewhere).
export const streetViewUrl = (lat: number | string, lng: number | string) =>
  `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
