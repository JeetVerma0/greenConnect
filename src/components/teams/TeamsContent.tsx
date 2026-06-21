"use client";

import { useState, useEffect } from "react";
import { Users, MapPin, Search, Plus, Compass, Award, Target, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CategoryBadge } from "@/components/ui/Badge";
import { createTeam, joinTeam, leaveTeam } from "@/lib/firestore";
import { TEAM_CATEGORIES } from "@/utils/constants";
import {
  formatCoordinates,
  getCurrentLocation,
  type GeoLocation,
} from "@/utils/geolocation";
import { useAuth } from "@/context/AuthContext";
import type { Team, TeamCategory } from "@/types/team";
import { TeamDetail } from "./TeamDetail";

interface TeamsContentProps {
  teams: Team[];
  onRefresh: () => void;
}

export function TeamsContent({ teams, onRefresh }: TeamsContentProps) {
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "general" as TeamCategory,
    radiusKm: "5",
  });

  useEffect(() => {
    if (selectedTeam) {
      const updated = teams.find((t) => t.id === selectedTeam.id);
      if (updated) {
        setSelectedTeam(updated);
      }
    }
  }, [teams, selectedTeam]);

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDetectLocation = async () => {
    setLocationStatus("");
    setDetectingLocation(true);
    try {
      const coords = await getCurrentLocation();
      setLocation(coords);
      setLocationStatus(
        `Staging Coordinates: ${formatCoordinates(coords.latitude, coords.longitude)}`
      );
    } catch (err) {
      setLocation(null);
      setLocationStatus(err instanceof Error ? err.message : "Failed to get location");
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (!location) {
      setError("Please set the staging location coordinates using your device GPS.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await createTeam(
        {
          name: form.name,
          description: form.description,
          category: form.category,
          radiusKm: Number(form.radiusKm),
          latitude: location.latitude,
          longitude: location.longitude,
          createdBy: firebaseUser.uid,
        },
        firebaseUser.uid
      );
      await refreshProfile();
      setShowCreate(false);
      setForm({ name: "", description: "", category: "general", radiusKm: "5" });
      setLocation(null);
      setLocationStatus("");
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (teamId: string) => {
    if (!firebaseUser || teamId.startsWith("mock-")) return;
    setLoading(true);
    try {
      await joinTeam(teamId, firebaseUser.uid);
      await refreshProfile();
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (teamId: string) => {
    if (!firebaseUser || teamId.startsWith("mock-")) return;
    setLoading(true);
    try {
      await leaveTeam(teamId, firebaseUser.uid);
      await refreshProfile();
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  if (selectedTeam) {
    return (
      <TeamDetail
        team={selectedTeam}
        onBack={() => {
          setSelectedTeam(null);
          onRefresh();
        }}
        onRefresh={onRefresh}
      />
    );
  }

  // Aggregate Community stats
  const totalVolunteers = teams.reduce((acc, curr) => acc + curr.members.length, 0);
  const totalResolved = teams.reduce((acc, curr) => acc + (curr.issuesResolved ?? 0), 0);

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-6xl mx-auto pb-16">
      
      {/* Title Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Cleanup Teams</h1>
          <p className="text-sm text-text-secondary">Join neighboring coalitions or register a new local task force</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="font-semibold shadow-sm">
          {showCreate ? "Cancel" : <span className="flex items-center gap-1.5"><Plus className="h-4 w-4" /> Create Team</span>}
        </Button>
      </div>

      {/* Community Stats Bar */}
      <div className="grid gap-4 grid-cols-3 bg-card-opacity-bg rounded-xl border border-border p-4">
        <div className="text-center space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50">Active Teams</p>
          <p className="text-xl font-bold text-text-primary">{teams.length}</p>
        </div>
        <div className="text-center space-y-0.5 border-x border-border">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50">Coordinated Volunteers</p>
          <p className="text-xl font-bold text-text-primary">{totalVolunteers}</p>
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50">Restored Sites</p>
          <p className="text-xl font-bold text-primary">{totalResolved}</p>
        </div>
      </div>

      {/* Create Team Form Drawer */}
      {showCreate && (
        <Card padding="lg" hoverable={false} className="border-border-strong bg-card-opacity-bg max-w-xl">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-white/5 pb-3">Register New Team</h2>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <Input
              label="Team Name"
              placeholder="e.g. Riverbank Restoration Alliance"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary/70">Team Description</label>
              <textarea
                placeholder="State your team's neighborhood focus, meeting times, and environment scope..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                required
                className="w-full rounded-xl border border-border-strong bg-bg-inner px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary/50 resize-none"
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Mission Focus"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as TeamCategory })}
                options={TEAM_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              />
              <Input
                label="Coverage Range (km)"
                type="number"
                min={1}
                max={50}
                value={form.radiusKm}
                onChange={(e) => setForm({ ...form, radiusKm: e.target.value })}
              />
            </div>
            
            <div className="rounded-xl border border-border bg-bg-inner p-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-text-primary uppercase tracking-wide">GPS Staging Point</p>
                <p className="text-[10px] text-text-secondary mt-0.5">
                  Establish coordinates of your primary volunteer operations base.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="text-xs py-2 px-3 font-semibold"
              >
                <MapPin className="h-3.5 w-3.5" />
                {detectingLocation ? "Detecting base GPS..." : "Register Base Coordinates"}
              </Button>
              {locationStatus && (
                <p className={`text-[10px] font-semibold ${location ? "text-primary" : "text-text-secondary"}`}>
                  {locationStatus}
                </p>
              )}
            </div>

            {error && <p className="text-xs text-danger font-medium">{error}</p>}
            
            <div className="flex gap-2 justify-end border-t border-border pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register Team"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Search Filter bar */}
      <div className="relative flex items-center bg-card-opacity-bg border border-border rounded-lg px-3.5 py-2.5">
        <Search className="h-4 w-4 text-text-secondary/50 shrink-0" />
        <input
          type="text"
          placeholder="Search team directories by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-2 w-full bg-transparent text-xs text-text-primary placeholder:text-text-secondary/40 outline-none"
        />
      </div>

      {/* Grid of Team Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((team) => {
          const isMember = profile?.joinedTeams?.includes(team.id);
          const successRate =
            team.issuesResolved && team.members.length
              ? Math.min(100, Math.round((team.issuesResolved / team.members.length) * 10))
              : 0;

          // Member initials generator list to make it look alive
          const initials = ["AM", "JD", "KR", "SL", "YN"];
          const avatarColors = [
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            "bg-blue-500/10 text-blue-400 border-blue-500/20",
            "bg-purple-500/10 text-purple-400 border-purple-500/20",
            "bg-amber-500/10 text-amber-400 border-amber-500/20",
            "bg-rose-500/10 text-rose-400 border-rose-500/20",
          ];
          const activityLevel = team.members.length >= 10
            ? "High 🔥"
            : team.members.length >= 4
            ? "Active ⚡"
            : "Staging 🌱";

          const isFeatured = team.id === "mock-team-1" || (team.issuesResolved && team.issuesResolved >= 10);

          return (
            <Card
              key={team.id}
              padding="lg"
              className={`group flex flex-col justify-between rounded-xl border transition-all duration-200 ${
                isFeatured
                  ? "bg-[var(--sidebar-item-active)] border-[var(--active-filter-border)] dark:bg-card dark:border-border"
                  : "bg-card border-border"
              }`}
              onClick={() => setSelectedTeam(team)}
            >
              <div>
                {/* Clean geometric grid banner instead of colorful gradients */}
                <div className={`mb-4 h-20 rounded-lg border flex items-center justify-between px-5 relative overflow-hidden ${
                  isFeatured ? "bg-white/50 dark:bg-bg-inner border-[var(--active-filter-border)] dark:border-border" : "bg-bg-inner border-border"
                }`}>
                  <div className="absolute right-[-10px] bottom-[-10px] text-white/[0.01] font-extrabold text-7xl select-none uppercase pointer-events-none">
                    {team.category}
                  </div>
                  <CategoryBadge category={team.category} />
                  {isMember ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--sidebar-item-active)] border border-[var(--active-filter-border)] dark:bg-primary/10 dark:border-primary/20 text-[10px] font-bold text-[var(--active-filter-text)] dark:text-primary px-2.5 py-0.5 z-10 shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] text-text-secondary/50 font-mono">ID: {team.id.slice(0, 8)}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className={`text-base font-bold transition-colors leading-tight ${
                    isFeatured ? "text-text-primary group-hover:text-primary-dark" : "text-text-primary group-hover:text-primary"
                  }`}>
                    {team.name}
                  </h3>
                  <p className="line-clamp-2 text-xs text-text-secondary leading-relaxed">
                    {team.description}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4 border-t border-border pt-4">
                {/* Member Avatars Stack & Metrics */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Simulated Member Avatars Stack */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2.5 overflow-hidden">
                      {team.members.slice(0, 3).map((_, idx) => (
                        <div
                          key={idx}
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[9px] font-bold shrink-0 ${
                            avatarColors[idx % avatarColors.length]
                          }`}
                        >
                          {initials[idx % initials.length]}
                        </div>
                      ))}
                      {team.members.length > 3 && (
                        <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-[8px] font-bold text-primary shrink-0">
                          +{team.members.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-text-secondary font-medium">
                      {team.members.length} volunteer{team.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                    <MapPin className="h-3.5 w-3.5 text-text-secondary/50" />
                    <span>{team.radiusKm} km radius</span>
                  </div>
                </div>

                {/* Cleanup Success Rates */}
                <div className={`grid grid-cols-3 gap-2.5 rounded-lg border p-3 text-xs text-text-secondary ${
                  isFeatured ? "bg-white/45 dark:bg-white/[0.01] border-[var(--active-filter-border)] dark:border-white/5" : "bg-white/[0.01] border-white/5"
                }`}>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[9px] font-bold text-text-secondary/50 uppercase tracking-wider block truncate">Impact</span>
                    <span className="font-semibold text-text-primary block truncate">{team.issuesResolved ?? 0} resolved</span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[9px] font-bold text-text-secondary/50 uppercase tracking-wider block truncate">Efficiency</span>
                    <span className="font-semibold text-primary block truncate">{successRate}% rate</span>
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[9px] font-bold text-text-secondary/50 uppercase tracking-wider block truncate">Activity</span>
                    <span className="font-semibold text-text-primary block truncate">{activityLevel}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-primary font-semibold group-hover:translate-x-0.5 transition-all">
                    View profile &rarr;
                  </span>
                  
                  {isMember ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLeave(team.id);
                      }}
                      disabled={loading || team.id.startsWith("mock-")}
                      className="text-xs font-semibold py-1.5 px-3"
                    >
                      Leave Team
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoin(team.id);
                      }}
                      disabled={loading || team.id.startsWith("mock-")}
                      className="text-xs font-semibold py-1.5 px-3"
                    >
                      Join Team
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

