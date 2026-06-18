import { getDistance } from "geolib";

export function distanceInMeters(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  return getDistance(
    { latitude: from.lat, longitude: from.lng },
    { latitude: to.lat, longitude: to.lng }
  );
}

export function distanceInKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  return distanceInMeters(from, to) / 1000;
}
