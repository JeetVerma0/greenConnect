"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { distanceInKm } from "@/utils/distance";
import { getCurrentLocation } from "@/utils/geolocation";
import type { Report } from "@/types/report";
import type { Team } from "@/types/team";

const MapContainer = dynamic(() => import("./MapContainer"), { ssr: false });

interface MapViewProps {
  reports: Report[];
  teams: Team[];
}

export function MapView({ reports, teams }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(() => {
    if (typeof window !== "undefined") {
      const savedLoc = localStorage.getItem("greenconnect_user_location");
      if (savedLoc) {
        try {
          const parsed = JSON.parse(savedLoc);
          if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
            return parsed;
          }
        } catch {
          // ignore
        }
      }
    }
    return null;
  });
  
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [locationLoading, setLocationLoading] = useState(() => userLocation === null);

  useEffect(() => {
    if (userLocation) return; // already loaded from local storage

    getCurrentLocation()
      .then((coords) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setUserLocation(loc);
        localStorage.setItem("greenconnect_user_location", JSON.stringify(loc));
        setLocationLoading(false);
      })
      .catch((err) => {
        console.error("Location error:", err); // use it so lint is happy
        setLocationLoading(false);
      });
  }, [userLocation]);

  const handleLocationChange = (loc: { lat: number; lng: number }) => {
    setUserLocation(loc);
    localStorage.setItem("greenconnect_user_location", JSON.stringify(loc));
  };

  const distance =
    selectedReport && userLocation
      ? distanceInKm(userLocation, {
          lat: selectedReport.latitude,
          lng: selectedReport.longitude,
        }).toFixed(1)
      : null;

  if (locationLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center lg:h-[calc(100vh-5rem)]">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-text-secondary">Getting your current location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)] lg:h-[calc(100vh-5rem)]">
      <MapContainer
        reports={reports}
        teams={teams}
        userLocation={userLocation}
        onSelectReport={setSelectedReport}
        onLocationChange={handleLocationChange}
      />

      {selectedReport && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] mx-auto max-w-lg">
          <Card padding="lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <StatusBadge status={selectedReport.status} />
                <h3 className="mt-2 font-semibold">{selectedReport.title}</h3>
                <p className="text-sm text-text-secondary">
                  {distance ? `${distance} km away · ` : ""}
                  Severity {selectedReport.severity}/5
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/reports/${selectedReport.id}`} className="flex-1">
                <Button variant="secondary" className="w-full">
                  View Details
                </Button>
              </Link>
              <Link href="/teams" className="flex-1">
                <Button className="w-full">Join Mission</Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
