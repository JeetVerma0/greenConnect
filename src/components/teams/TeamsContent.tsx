"use client";

import { useState } from "react";
import { Users, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CategoryBadge } from "@/components/ui/Badge";
import { createTeam, joinTeam, leaveTeam } from "@/lib/firestore";
import { TEAM_CATEGORIES, CITY_COORDS } from "@/utils/constants";
import { useAuth } from "@/context/AuthContext";
import type { Team, TeamCategory } from "@/types/team";

interface TeamsContentProps {
  teams: Team[];
  onRefresh: () => void;
}

export function TeamsContent({ teams, onRefresh }: TeamsContentProps) {
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "general" as TeamCategory,
    city: "delhi",
    radiusKm: "5",
  });

  const filtered = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    setLoading(true);
    setError("");
    try {
      await createTeam(
        {
          name: form.name,
          description: form.description,
          category: form.category,
          city: form.city,
          radiusKm: Number(form.radiusKm),
          latitude: 0,
          longitude: 0,
          createdBy: firebaseUser.uid,
        },
        firebaseUser.uid
      );
      await refreshProfile();
      setShowCreate(false);
      setForm({ name: "", description: "", category: "general", city: "delhi", radiusKm: "5" });
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

  const cityOptions = Object.keys(CITY_COORDS).map((c) => ({
    value: c,
    label: c.charAt(0).toUpperCase() + c.slice(1),
  }));

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Teams</h1>
          <p className="text-text-secondary">Join or create cleanup teams near you</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? "Cancel" : "Create Team"}
        </Button>
      </div>

      {showCreate && (
        <Card padding="lg">
          <h2 className="font-medium">Create a Team</h2>
          <form onSubmit={handleCreate} className="mt-4 space-y-4">
            <Input
              label="Team Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <div>
              <label className="text-sm text-text-secondary">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                required
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Select
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as TeamCategory })}
                options={TEAM_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
              />
              <Select
                label="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                options={cityOptions}
              />
              <Input
                label="Coverage Radius (km)"
                type="number"
                min={1}
                max={50}
                value={form.radiusKm}
                onChange={(e) => setForm({ ...form, radiusKm: e.target.value })}
              />
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </form>
        </Card>
      )}

      <Input
        placeholder="Search teams by name or city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((team) => {
          const isMember = profile?.joinedTeams?.includes(team.id);
          const successRate =
            team.issuesResolved && team.members.length
              ? Math.min(100, Math.round((team.issuesResolved / team.members.length) * 10))
              : 0;

          return (
            <Card key={team.id} padding="lg">
              <div className="mb-3 h-24 rounded-lg bg-gradient-to-r from-primary/20 to-surface" />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{team.name}</h3>
                  <CategoryBadge category={team.category} />
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{team.description}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {team.members.length} members
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {team.city} · {team.radiusKm}km
                </span>
              </div>
              <div className="mt-3 flex gap-4 text-sm">
                <span>{team.issuesResolved ?? 0} resolved</span>
                <span>{successRate}% success</span>
              </div>
              <div className="mt-4">
                {isMember ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleLeave(team.id)}
                    disabled={loading || team.id.startsWith("mock-")}
                  >
                    Leave Team
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleJoin(team.id)}
                    disabled={loading || team.id.startsWith("mock-")}
                  >
                    Join Team
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
