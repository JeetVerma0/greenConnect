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

export function getCurrentLocation(): Promise<GeoLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(
        new GeolocationError(
          "Location is not available on this device. Enable GPS or try a different browser."
        )
      );
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
        const messages: Record<number, string> = {
          [error.PERMISSION_DENIED]:
            "Location permission denied. Allow location access in your browser settings.",
          [error.POSITION_UNAVAILABLE]:
            "Unable to determine your location. Check that GPS is enabled.",
          [error.TIMEOUT]: "Location request timed out. Please try again.",
        };
        reject(
          new GeolocationError(
            messages[error.code] ?? "Failed to get your location."
          )
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  });
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
}
