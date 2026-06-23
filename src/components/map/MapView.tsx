"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { X, Search, Filter, MapPin, Users, Info, ChevronRight, History } from "lucide-react";
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

  // Smart Search & Dropdown UI States
  const [showResults, setShowResults] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("greenconnect_recent_searches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  // Click outside to dismiss search results panel
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Simulate skeleton loading animation
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchLoading(true);
      const timer = setTimeout(() => {
        setSearchLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  const saveRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem("greenconnect_recent_searches", JSON.stringify(next));
      return next;
    });
  };

  const removeRecentSearch = (queryToRemove: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((s) => s !== queryToRemove);
      localStorage.setItem("greenconnect_recent_searches", JSON.stringify(next));
      return next;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("greenconnect_recent_searches");
  };

  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    
    return reports.filter((r) => {
      const matchesId = r.id.toLowerCase() === query || r.id.toLowerCase().startsWith(query);
      const matchesTitle = r.title.toLowerCase().includes(query);
      const matchesDesc = r.description.toLowerCase().includes(query);
      const matchesCategory = r.category.toLowerCase().includes(query);
      const matchesStatus = r.status.replace("_", " ").toLowerCase().includes(query);
      
      const latString = r.latitude.toFixed(4);
      const lngString = r.longitude.toFixed(4);
      const matchesCoords = latString.includes(query) || lngString.includes(query);

      return matchesId || matchesTitle || matchesDesc || matchesCategory || matchesStatus || matchesCoords;
    });
  };
  
  const searchResults = getSearchResults();

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setShowResults(false);
    saveRecentSearch(searchQuery || report.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const count = searchResults.length;
        if (count === 0) return -1;
        return (prev + 1) % count;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => {
        const count = searchResults.length;
        if (count === 0) return -1;
        return (prev - 1 + count) % count;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
        handleSelectReport(searchResults[focusedIndex]);
      }
    } else if (e.key === "Escape") {
      setShowResults(false);
      e.currentTarget.blur();
    }
  };

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-primary/30 text-text-primary dark:text-white rounded px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

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
          selectedReport={selectedReport}
        />
      </div>

      {/* Floating Google Maps-Style Control Panel (Top-Left) */}
      <div className="absolute top-4 left-4 z-[1000] w-[calc(100%-2rem)] max-w-sm pointer-events-auto space-y-2" ref={searchContainerRef}>
        <div className="rounded-xl map-overlay-panel p-3.5 space-y-3 relative">
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
                setFocusedIndex(-1);
              }}
              onFocus={() => setShowResults(true)}
              onKeyDown={handleKeyDown}
              className="ml-2 w-full bg-transparent text-xs text-text-primary placeholder:text-[#6B7280] dark:placeholder:text-text-secondary/50 outline-none font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setShowResults(false);
                  setFocusedIndex(-1);
                }} 
                className="text-text-secondary hover:text-text-primary p-0.5 rounded-full hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Smart Search Results Dropdown Panel */}
          {showResults && (searchQuery.trim() || recentSearches.length > 0) && (
            <div className="absolute left-3.5 right-3.5 top-[62px] z-50 rounded-2xl glass-card backdrop-blur-2xl p-3 shadow-2xl shadow-black/40 max-h-[320px] overflow-y-auto space-y-2 select-none">
              {searchLoading ? (
                <div className="space-y-2 py-1">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.01] border border-transparent">
                      <div className="h-8 w-8 rounded-lg bg-white/5 animate-pulse shrink-0" />
                      <div className="space-y-1.5 w-full">
                        <div className="h-3 w-2/3 bg-white/5 animate-pulse rounded" />
                        <div className="h-2.5 w-1/2 bg-white/5 animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                searchResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4 text-center space-y-2">
                    <Search className="h-8 w-8 text-text-secondary/30 animate-bounce" />
                    <h4 className="text-xs font-bold text-text-primary">No matching reports found</h4>
                    <p className="text-[10px] text-text-secondary max-w-[220px] leading-normal">
                      Try searching by category, location, report ID, or description keywords.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {searchResults.map((report, index) => {
                      const isFocused = focusedIndex === index;
                      const dateText = new Date(report.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      const emojiMap: Record<string, string> = {
                        waste: "🗑️",
                        water: "💧",
                        air: "💨",
                        infrastructure: "🏗️",
                        wildlife: "🦊",
                      };
                      const emoji = emojiMap[report.category] || "📍";

                      return (
                        <div
                          key={report.id}
                          onClick={() => handleSelectReport(report)}
                          onMouseEnter={() => setFocusedIndex(index)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                            isFocused
                              ? "bg-primary/8 border-primary/30 shadow-[0_0_8px_rgba(16,185,129,0.08)]"
                              : "bg-white/[0.01] dark:bg-card/40 border-transparent hover:bg-white/[0.03] dark:hover:bg-white/5"
                          }`}
                        >
                          <div className="h-8 w-8 rounded-lg bg-card-opacity-bg border border-border flex items-center justify-center text-base shrink-0">
                            {emoji}
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-bold text-text-primary truncate">
                                {highlightText(report.title, searchQuery)}
                              </h4>
                              <span className="text-[9px] text-text-secondary/70 shrink-0">
                                {dateText}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <CategoryBadge category={report.category} />
                              <StatusBadge status={report.status} />
                              <span className="text-[9px] text-text-secondary/70 truncate flex items-center gap-0.5 font-medium">
                                <MapPin className="h-2.5 w-2.5 text-primary/80" />
                                {report.latitude.toFixed(3)}, {report.longitude.toFixed(3)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-1 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/60">
                      Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[9px] font-bold text-danger hover:text-red-500 transition-colors uppercase tracking-wider"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-0.5">
                    {recentSearches.map((query) => (
                      <div
                        key={query}
                        className="flex items-center justify-between rounded-lg hover:bg-white/[0.03] p-1.5 transition-colors group cursor-pointer"
                        onClick={() => {
                          setSearchQuery(query);
                          setShowResults(true);
                          setFocusedIndex(-1);
                        }}
                      >
                        <div className="flex items-center gap-2 text-xs text-text-secondary group-hover:text-text-primary min-w-0">
                          <History className="h-3.5 w-3.5 text-text-secondary/40 shrink-0" />
                          <span className="truncate">{query}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(query);
                          }}
                          className="text-text-secondary/40 hover:text-text-primary p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

