const R = 3958.8 // Earth radius in miles

export const toRad = (deg) => (deg * Math.PI) / 180

// Great-circle distance in miles between two lat/lng points.
export function haversine(lat1, lng1, lat2, lng2) {
  if (lat2 == null || lng2 == null || lat1 == null || lng1 == null) return null
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Convert a GeoJSON Point into a demo map pin position (percentages).
// The Explore page renders pins purely by x/y percentages, so we map the
// merchant's real coordinates onto a fake "neighborhood view" bounding box.
const LNG_MIN = -118.32
const LNG_MAX = -118.2
const LAT_MIN = 34.02
const LAT_MAX = 34.11

export function posFromLatLng(loc) {
  const coords = loc?.coordinates
  if (!coords || coords.length < 2) return { x: 50, y: 50 }
  const [lng, lat] = coords
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
  const x = clamp(10 + (80 * (lng - LNG_MIN)) / (LNG_MAX - LNG_MIN), 8, 92)
  const y = clamp(92 - (85 * (lat - LAT_MIN)) / (LAT_MAX - LAT_MIN), 8, 92)
  return { x: Math.round(x), y: Math.round(y) }
}