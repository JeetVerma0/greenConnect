"use client";

import { useEffect } from "react";
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import type { Report } from "@/types/report";
import type { Team } from "@/types/team";

const reportIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const getReportIcon = (category: string, status: string) => {
  const emojiMap: Record<string, string> = {
    waste: "🗑️",
    water: "💧",
    air: "💨",
    infrastructure: "🏗️",
    wildlife: "🦊"
  };
  const emoji = emojiMap[category] || "📍";
  
  const statusColor = status === "verified_resolution" ? "#10b981" : status === "in_progress" ? "#3b82f6" : "#f59e0b";
  
  return L.divIcon({
    className: "custom-report-icon",
    html: `
      <div class="custom-report-icon-inner">
        ${emoji}
        <span style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; border: 1.5px solid var(--card); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);"></span>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -17],
  });
};

interface MapContainerProps {
  reports: Report[];
  teams: Team[];
  userLocation: { lat: number; lng: number } | null;
  onSelectReport: (report: Report) => void;
  onLocationChange?: (location: { lat: number; lng: number }) => void;
}

function MapUpdater({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center.lat, center.lng, map]);
  return null;
}

export default function MapContainer({
  reports,
  teams,
  userLocation,
  onSelectReport,
  onLocationChange,
}: MapContainerProps) {
  const center = userLocation ?? { lat: 28.6139, lng: 77.209 };
  const tileUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <LeafletMap
      center={[center.lat, center.lng]}
      zoom={13}
      className="h-full w-full"
      scrollWheelZoom
    >
      <MapUpdater center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url={tileUrl}
      />

      {userLocation && (
        <>
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
            draggable={!!onLocationChange}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                if (onLocationChange) {
                  onLocationChange({ lat: position.lat, lng: position.lng });
                }
              },
            }}
          >
            <Popup>Your location (Drag to adjust)</Popup>
          </Marker>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={10000} // 10km radius
            pathOptions={{ color: "#3B82F6", fillColor: "#3B82F6", fillOpacity: 0.03, weight: 1, dashArray: "5, 5" }}
          />
        </>
      )}

      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={getReportIcon(report.category, report.status)}
          eventHandlers={{
            click: () => onSelectReport(report),
          }}
        >
          <Popup>
            <div className="text-center p-0.5">
              <strong className="block text-xs font-bold text-text-primary mb-1">{report.title}</strong>
              <span className="text-[10px] text-text-secondary capitalize">{report.category} · {report.status.replace("_", " ")}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </LeafletMap>
  );
}

