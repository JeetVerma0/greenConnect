"use client";

import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Circle } from "react-leaflet";
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

interface MapContainerProps {
  reports: Report[];
  teams: Team[];
  userLocation: { lat: number; lng: number } | null;
  onSelectReport: (report: Report) => void;
}

export default function MapContainer({
  reports,
  teams,
  userLocation,
  onSelectReport,
}: MapContainerProps) {
  const center = userLocation ?? { lat: 28.6139, lng: 77.209 };

  return (
    <LeafletMap
      center={[center.lat, center.lng]}
      zoom={13}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Your location</Popup>
        </Marker>
      )}

      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.latitude, report.longitude]}
          icon={reportIcon}
          eventHandlers={{
            click: () => onSelectReport(report),
          }}
        >
          <Popup>
            <strong>{report.title}</strong>
            <br />
            {report.category} · {report.status}
          </Popup>
        </Marker>
      ))}

      {teams.map((team) => (
        <Circle
          key={team.id}
          center={[team.latitude, team.longitude]}
          radius={team.radiusKm * 1000}
          pathOptions={{ color: "#22C55E", fillColor: "#22C55E", fillOpacity: 0.08 }}
        />
      ))}
    </LeafletMap>
  );
}
