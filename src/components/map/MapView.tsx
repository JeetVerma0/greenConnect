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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    getCurrentLocation()
      .then((coords) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
      })
      .catch(() => {
        // Map falls back to default center when GPS is unavailable.
      });
  }, []);

  const distance =
    selectedReport && userLocation
      ? distanceInKm(userLocation, {
          lat: selectedReport.latitude,
          lng: selectedReport.longitude,
        }).toFixed(1)
      : null;

  return (
    <div className="relative h-[calc(100vh-8rem)] lg:h-[calc(100vh-5rem)]">
      <MapContainer
        reports={reports}
        teams={teams}
        userLocation={userLocation}
        onSelectReport={setSelectedReport}
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
