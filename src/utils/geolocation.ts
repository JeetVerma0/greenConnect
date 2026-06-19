export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export class GeolocationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeolocationError";
  }
}

export async function getCurrentLocation(): Promise<GeoLocation> {
  const fetchIpLocation = async (): Promise<GeoLocation> => {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("Failed to fetch IP location");
    const data = await res.json();
    if (data.error) throw new Error(data.reason);
    return { latitude: data.latitude, longitude: data.longitude };
  };

  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      fetchIpLocation().then(resolve).catch(() => {
        reject(new GeolocationError("Location is not available on this device."));
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        fetchIpLocation().then(resolve).catch(() => {
          const messages: Record<number, string> = {
            [error.PERMISSION_DENIED]: "Location permission denied.",
            [error.POSITION_UNAVAILABLE]: "Unable to determine your location.",
            [error.TIMEOUT]: "Location request timed out.",
          };
          reject(new GeolocationError(messages[error.code] ?? "Failed to get your location."));
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}
