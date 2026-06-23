"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { X, Search, Filter, MapPin, Users, Info, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, CategoryBadge } from "@/components/ui/Badge";
import { distanceInKm } from "@/utils/distance";
import { getCurrentLocation } from "@/utils/geolocation";
import type { Report } from "@/types/report";
import type { Team } from "@/types/team";

const MapContainer = dynamic(() => import("./MapContainer"), { ssr: false });

interface MapViewProps {
  reports: Report[];
  teams: Team[];
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "waste", label: "Waste 🗑️" },
  { value: "water", label: "Water 💧" },
  { value: "air", label: "Air 💨" },
  { value: "infrastructure", label: "Infrastructure 🏗️" },
  { value: "wildlife", label: "Wildlife 🦊" },
];

const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_verification", label: "Review" },
  { value: "verified_resolution", label: "Verified" },
];

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
  
  // Floating Filter States (Client-Side Only)
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState("all");

  useEffect(() => {
    if (userLocation) return;

    getCurrentLocation()
      .then((coords) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setUserLocation(loc);
        localStorage.setItem("greenconnect_user_location", JSON.stringify(loc));
        setLocationLoading(false);
      })
      .catch((err) => {
        console.error("Location error:", err);
        setLocationLoading(false);
      });
  }, [userLocation]);

  const handleLocationChange = (loc: { lat: number; lng: number }) => {
    setUserLocation(loc);
    localStorage.setItem("greenconnect_user_location", JSON.stringify(loc));
  };

  // Filter reports client-side
  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || r.category === activeCategory;
    const matchesStatus = activeStatus === "all" || r.status === activeStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const distance =
    selectedReport && userLocation
      ? distanceInKm(userLocation, {
          lat: selectedReport.latitude,
          lng: selectedReport.longitude,
         }).toFixed(1)
      : null;

  return (
    <div className="relative h-[calc(100vh-7.5rem)] lg:h-[calc(100vh-4.5rem)] w-full overflow-hidden bg-background">
      {/* Full-Height Leaflet Map */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <MapContainer
          reports={filteredReports}
          teams={teams}
          userLocation={userLocation}
          onSelectReport={setSelectedReport}
          onLocationChange={handleLocationChange}
        />
      </div>

      {/* Floating Google Maps-Style Control Panel (Top-Left) */}
      <div className="absolute top-4 left-4 z-[1000] w-[calc(100%-2rem)] max-w-sm pointer-events-auto space-y-2">
        <div className="rounded-xl map-overlay-panel p-3.5 space-y-3">
          {/* Search bar */}
          <div className="relative flex items-center bg-white dark:bg-card border border-[#10b981]/12 dark:border-border rounded-lg px-3 py-2 focus-within:border-primary/40 focus-within:shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_0_16px_rgba(16,185,129,0.06)] transition-all duration-200">
            {locationLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent shrink-0" title="Acquiring GPS location..." />
            ) : (
              <Search className="h-4 w-4 text-text-secondary/50 shrink-0" />
            )}
            <input
              type="text"
              placeholder={locationLoading ? "Locating base coordinates..." : "Search environmental alerts..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-2 w-full bg-transparent text-xs text-text-primary placeholder:text-[#6B7280] dark:placeholder:text-text-secondary/50 outline-none font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-text-secondary hover:text-text-primary">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Category Chips */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold border transition-all duration-200 interactive-hover ${
                  activeCategory === cat.value
                    ? "bg-[var(--active-filter-bg)] text-[var(--active-filter-text)] border-[var(--active-filter-border)] dark:bg-primary dark:text-black dark:border-primary"
                    : "bg-card text-text-secondary border-border hover:text-text-primary hover:bg-primary/8 dark:hover:bg-primary/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Status Segment Control */}
          <div className="grid grid-cols-4 gap-1 bg-surface p-0.5 rounded-lg border border-border">
            {STATUSES.map((status) => (
              <button
                key={status.value}
                onClick={() => setActiveStatus(status.value)}
                className={`py-1 text-[9px] font-bold uppercase rounded border transition-all duration-200 ${
                  activeStatus === status.value
                    ? "bg-[var(--active-status-bg)] text-[var(--active-status-text)] border-[var(--active-status-border)] dark:bg-card dark:text-primary dark:border-primary/20 shadow-sm"
                    : "border-transparent text-text-secondary/70 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {status.value === "all" ? "All" : status.label.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Inspector Sidebar Panel (Right/Bottom Sheet) */}
      {selectedReport && (
        <div className="absolute bottom-4 left-4 right-4 sm:bottom-auto sm:left-auto sm:top-4 sm:right-4 z-[1000] pointer-events-auto w-auto max-w-sm sm:w-[350px]">
          <div className="rounded-xl map-overlay-panel p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-right-4 duration-300">
            {/* Header info */}
            <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={selectedReport.status} />
                  <CategoryBadge category={selectedReport.category} />
                </div>
                <h3 className="font-bold text-sm text-text-primary mt-2 leading-tight">{selectedReport.title}</h3>
                <p className="text-[10px] text-text-secondary font-medium">
                  {distance ? `${distance} km away · ` : ""}
                  Severity {selectedReport.severity}/5
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-lg p-1 text-text-secondary hover:bg-card-opacity-bg hover:text-text-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-text-secondary/50 uppercase tracking-widest flex items-center gap-1">
                <Info className="h-3 w-3" /> Issue Description
              </span>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">
                {selectedReport.description}
              </p>
            </div>

            {/* Verification info */}
            <div className="flex items-center gap-2 rounded-lg bg-[var(--sidebar-item-active)] border border-[var(--active-filter-border)] dark:bg-card-opacity-bg dark:border-border p-3 text-xs text-text-secondary">
              <Users className="h-4 w-4 text-primary shrink-0" />
              <span>
                Verified by <strong className="text-text-primary">{selectedReport.verificationCount} volunteers</strong>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Link href={`/reports/${selectedReport.id}`} className="w-full">
                <Button variant="secondary" size="sm" className="w-full text-xs font-semibold py-2">
                  Details <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
              <Link href="/teams" className="w-full">
                <Button size="sm" className="w-full text-xs font-semibold py-2">
                  Join Mission
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

