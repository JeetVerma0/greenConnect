"use client";

import { useState, useEffect } from "react";
import { Edit, MapPin, Award, TrendingUp, X, Leaf, Users, Loader2, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { getBadgeDefinition, BADGE_DEFINITIONS } from "@/utils/badges";
import { getTeams, updateUserProfile, uploadImage, getUserReports } from "@/lib/firestore";
import { getCurrentLocation } from "@/utils/geolocation";
import type { Team } from "@/types/team";
import type { Report } from "@/types/report";

const tabs = ["Impact", "Badges", "Teams & Activity"] as const;

interface RankInfo {
  name: string;
  emoji: string;
  nextName: string;
  minPoints: number;
  maxPoints: number;
}

function getRankInfo(score: number): RankInfo {
  if (score <= 50) {
    return { name: "Seedling Ranger", emoji: "🌱", nextName: "Leaf Guardian", minPoints: 0, maxPoints: 50 };
  } else if (score <= 150) {
    return { name: "Leaf Guardian", emoji: "🌿", nextName: "Forest Protector", minPoints: 51, maxPoints: 150 };
  } else if (score <= 350) {
    return { name: "Forest Protector", emoji: "🌳", nextName: "Eco Champion", minPoints: 151, maxPoints: 350 };
  } else {
    return { name: "Eco Champion", emoji: "👑", nextName: "Ultimate Legend", minPoints: 351, maxPoints: 1000 };
  }
}

export function ProfileContent() {
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Impact");
  const [teamsMap, setTeamsMap] = useState<Record<string, Team>>({});
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  
  // Edit Profile States
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhotoURL, setEditPhotoURL] = useState("");
  const [editLat, setEditLat] = useState("");
  const [editLng, setEditLng] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // New avatar file & GPS loading states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Sync edits when profile loads
  useEffect(() => {
    if (profile) {
      setEditName(profile.name || "");
      setEditBio(profile.bio || "");
      setEditPhotoURL(profile.photoURL || "");
      setEditLat(profile.latitude?.toString() || "");
      setEditLng(profile.longitude?.toString() || "");
    }
  }, [profile]);

  // Load team information to resolve team names
  useEffect(() => {
    getTeams()
      .then((teamsList) => {
        const mapping: Record<string, Team> = {};
        teamsList.forEach((t) => {
          mapping[t.id] = t;
        });
        setTeamsMap(mapping);
      })
      .catch((err) => console.error("Error fetching teams in Profile:", err));
  }, []);

  // Fetch the volunteer's reported issues
  useEffect(() => {
    if (!firebaseUser) return;
    setLoadingReports(true);
    getUserReports(firebaseUser.uid)
      .then(setUserReports)
      .catch((err) => console.error("Error fetching reports in Profile:", err))
      .finally(() => setLoadingReports(false));
  }, [firebaseUser, profile?.reportsCount]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setError("");
    try {
      const coords = await getCurrentLocation();
      setEditLat(coords.latitude.toFixed(6));
      setEditLng(coords.longitude.toFixed(6));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to detect location coordinates");
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    setSaving(true);
    setError("");
    try {
      let finalPhotoURL = editPhotoURL;
      
      // If a file was selected, upload it to Firebase Storage first
      if (imageFile) {
        const uploadPath = `users/${firebaseUser.uid}/avatar_${Date.now()}`;
        finalPhotoURL = await uploadImage(uploadPath, imageFile);
      }

      await updateUserProfile(firebaseUser.uid, {
        name: editName.trim(),
        bio: editBio.trim(),
        photoURL: finalPhotoURL.trim() || undefined,
        latitude: editLat ? Number(editLat) : undefined,
        longitude: editLng ? Number(editLng) : undefined,
      });

      await refreshProfile();
      setShowEdit(false);
      setImageFile(null);
      setImagePreview("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const earnedBadges = profile?.badges ?? [];
  const score = profile?.ecoScore ?? 0;
  const rank = getRankInfo(score);

  // Calculate rank progress percentage
  const rankRange = rank.maxPoints - rank.minPoints;
  const rankProgress = score - rank.minPoints;
  const rankPercent = Math.min(100, Math.max(0, Math.round((rankProgress / rankRange) * 100)));

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-6xl mx-auto pb-16">
      {/* 2026 Premium Eco Hero Banner */}
      <Card
        padding="lg"
        className="bg-card-opacity-bg border border-border rounded-2xl relative overflow-hidden md:p-8"
        hoverable={false}
      >
        {/* Ambient lighting under the hero score */}
        <div className="hidden dark:block absolute right-[-10%] top-[-20%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[90px] pointer-events-none -z-10" />
        <div className="hidden dark:block absolute left-[-10%] bottom-[-20%] w-[250px] h-[250px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none -z-10" />
        
        <div className="grid gap-8 md:grid-cols-12 items-center">
          {/* Column 1: Profile Main Information */}
          <div className="md:col-span-4 space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.name}
                  className="h-20 w-20 rounded-2xl border border-white/10 object-cover shadow-md"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-3xl font-extrabold text-primary shrink-0 shadow-inner">
                  {profile?.name?.charAt(0).toUpperCase() ?? "V"}
                </div>
              )}
              
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-text-primary tracking-tight leading-none">{profile?.name ?? "Volunteer"}</h1>
                <p className="text-xs text-text-secondary">{profile?.email}</p>
                <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2.5 py-0.5 mt-1.5">
                  {rank.emoji} {rank.name}
                </div>
              </div>
            </div>

            {profile?.bio && (
              <p className="text-xs text-text-secondary leading-relaxed italic border-l-2 border-primary/20 pl-3 py-0.5 max-w-sm mx-auto md:mx-0">
                &ldquo;{profile.bio}&rdquo;
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)} className="text-xs font-semibold py-1.5 px-3">
                <Edit className="h-3.5 w-3.5" /> Edit Profile
              </Button>
              {(profile?.latitude || profile?.longitude) && (
                <div className="flex items-center gap-1 text-[10px] text-text-secondary/50 font-mono">
                  <MapPin className="h-3.5 w-3.5 text-primary/50" />
                  <span>Staging Base</span>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: The Hero Eco Score Gauge */}
          <div className="md:col-span-4 flex flex-col items-center justify-center border-y md:border-y-0 md:border-x border-border dark:border-white/5 py-6 md:py-0 px-6">
            <div className="relative flex items-center justify-center h-32 w-32">
              {/* Circular Gauge Background Track */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className="stroke-[var(--sidebar-item-active)] dark:stroke-white/[0.04]"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Active Progress Segment */}
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  className="stroke-primary"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - rankPercent / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
              </svg>
              
              {/* Center Content */}
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-text-primary tracking-tight">{score}</span>
                <span className="text-[9px] font-bold text-text-secondary/50 uppercase tracking-widest">Eco Score</span>
              </div>
            </div>

            <div className="text-center mt-3 space-y-1">
              <p className="text-xs text-text-secondary font-semibold">
                {rankProgress} / {rankRange} XP to Next Tier
              </p>
              <p className="text-[9px] text-text-secondary/40 font-semibold uppercase tracking-wider">
                {score >= 350 ? "Max Rank Achieved" : `Next: ${rank.nextName}`}
              </p>
            </div>
          </div>

          {/* Column 3: Showcase Achievements & Impact */}
          <div className="md:col-span-4 space-y-4">
            <span className="text-[9px] font-bold text-primary uppercase tracking-widest block text-center md:text-left">
              Environmental Impact Summary
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border dark:bg-white/[0.02] dark:border-white/5 rounded-xl p-3 space-y-1">
                <span className="text-[9px] font-bold text-text-secondary/40 uppercase tracking-wider block">Issues Logged</span>
                <span className="text-base font-extrabold text-text-primary block">{profile?.reportsCount ?? 0}</span>
                <span className="text-[9px] text-text-secondary/60 block">Incidents flagged</span>
              </div>

              <div className="bg-[var(--sidebar-item-active)] border border-[var(--active-filter-border)] dark:bg-primary/[0.02] dark:border-primary/10 rounded-xl p-3 space-y-1">
                <span className="text-[9px] font-bold text-text-primary/75 dark:text-primary/60 uppercase tracking-wider block">Resolved Proofs</span>
                <span className="text-base font-extrabold text-text-primary dark:text-primary block">{profile?.resolvedCount ?? 0}</span>
                <span className="text-[9px] text-text-secondary dark:text-primary/60 block">Cleanups verified</span>
              </div>

              <div className="bg-card border border-border dark:bg-white/[0.02] dark:border-white/5 rounded-xl p-3 space-y-1">
                <span className="text-[9px] font-bold text-text-secondary/40 uppercase tracking-wider block">Audit Logs</span>
                <span className="text-base font-extrabold text-text-primary block">{profile?.verificationsCount ?? 0}</span>
                <span className="text-[9px] text-text-secondary/60 block">Verifications made</span>
              </div>

              <div className="bg-card border border-border dark:bg-white/[0.02] dark:border-white/5 rounded-xl p-3 space-y-1">
                <span className="text-[9px] font-bold text-text-secondary/40 uppercase tracking-wider block">Leaderboard</span>
                <span className="text-base font-extrabold text-text-primary block">#{Math.max(1, 100 - (profile?.ecoScore ?? 0))}</span>
                <span className="text-[9px] text-text-secondary/60 block">Global rank tier</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Vercel-style Tab Selector bar */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-0.5 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold tracking-wide transition-all border-b-2 ${
              activeTab === tab
                ? "text-primary border-primary font-semibold"
                : "text-text-secondary border-transparent hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB: Impact stats and Activity log timeline */}
      {activeTab === "Impact" && (
        <div className="space-y-6">
          {/* Key Metrics grid */}
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Issues Logged", value: profile?.reportsCount ?? 0, desc: "Incidents flagged" },
              { label: "Issues Resolved", value: profile?.resolvedCount ?? 0, desc: "Cleanups completed" },
              { label: "Verifications Made", value: profile?.verificationsCount ?? 0, desc: "Community audit logs" },
              { label: "Community Ranking", value: `#${Math.max(1, 100 - (profile?.ecoScore ?? 0))}`, desc: "Auditor standings" },
            ].map(({ label, value, desc }) => (
              <Card key={label} padding="sm" className="bg-card-opacity-bg border border-border rounded-xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50">{label}</p>
                <p className="mt-2 text-2xl font-extrabold text-text-primary tracking-tight">{value}</p>
                <p className="mt-1 text-[9px] text-text-secondary/60">{desc}</p>
              </Card>
            ))}
          </div>

          {/* Activity Log Stepper Timeline */}
          <Card padding="lg" hoverable={false} className="border-border bg-card-opacity-bg rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border pb-3 mb-5">
              Verified Audit Timeline
            </h3>
            
            <div className="relative border-l border-border pl-5 ml-2.5 space-y-6 text-xs text-text-secondary">
              {/* Event 1 */}
              <div className="relative space-y-1">
                <span className="absolute -left-[26px] top-0 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-text-primary">Eco Score Updated</p>
                  <span className="text-[9px] font-mono text-text-secondary/40">Latest</span>
                </div>
                <p className="text-text-secondary/70">Score adjusted to {score} points reflecting volunteer operations.</p>
              </div>

              {/* Event 2 */}
              <div className="relative space-y-1">
                <span className="absolute -left-[26px] top-0 flex h-3 w-3 items-center justify-center rounded-full bg-primary/40 ring-4 ring-background" />
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-text-primary">Staging Base Registered</p>
                  <span className="text-[9px] font-mono text-text-secondary/40">Setup</span>
                </div>
                <p className="text-text-secondary/70">GPS Base established at coordinate registry.</p>
              </div>

              {/* Event 3 */}
              <div className="relative space-y-1">
                <span className="absolute -left-[26px] top-0 flex h-3 w-3 items-center justify-center rounded-full bg-primary/40 ring-4 ring-background" />
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-text-primary">Joined Volunteer Coalition</p>
                  <span className="text-[9px] font-mono text-text-secondary/40">Coalition</span>
                </div>
                <p className="text-text-secondary/70">Registered active status with neighboring cleanup teams.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB: Badges certifications */}
      {activeTab === "Badges" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_DEFINITIONS.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <Card
                key={badge.id}
                className={`transition-all duration-200 border-border rounded-xl flex flex-col justify-between ${
                  earned ? "bg-[var(--sidebar-item-active)] border-[var(--active-filter-border)] dark:bg-primary/[0.02] dark:border-primary/20" : "opacity-45 bg-card-opacity-bg"
                }`}
                hoverable={earned}
              >
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 rounded-lg border flex items-center justify-center text-2xl shrink-0 ${
                    earned ? "bg-white dark:bg-primary/10 border-[var(--active-filter-border)] dark:border-primary/20 shadow-sm" : "bg-card-opacity-bg border-border"
                  }`}>
                    {badge.emoji}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary">{badge.name}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{badge.description}</p>
                  </div>
                </div>
                
                {earned ? (
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] text-primary font-bold">
                    <span>Audit Certification Active</span>
                    <span className="h-4 w-4 rounded-full bg-white/60 dark:bg-primary/20 text-primary border border-primary/20 flex items-center justify-center text-[8px]">
                      ✓
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-border text-[9px] text-text-secondary/50 font-bold uppercase tracking-wider">
                    Locked Badge
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB: Teams list & Reported issues */}
      {activeTab === "Teams & Activity" && (
        <div className="space-y-6">
          {/* Teams list */}
          <Card padding="lg" hoverable={false} className="border-border bg-card-opacity-bg rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border pb-3 mb-4 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" /> Registered Coalitions
            </h3>

            {profile?.joinedTeams && profile.joinedTeams.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.joinedTeams.map((teamId) => {
                  const matchedTeam = teamsMap[teamId];
                  const teamName = matchedTeam?.name || `Team (ID: ${teamId.slice(0, 8)})`;
                  const category = matchedTeam?.category || "general";

                  return (
                    <div
                      key={teamId}
                      className="rounded-xl border border-border bg-bg-inner p-4 flex items-center justify-between gap-3 hover:border-primary/20 transition-all"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs font-bold text-text-primary truncate">{teamName}</p>
                        <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-text-secondary rounded border border-border bg-card-opacity-bg px-2 py-0.5">
                          {category}
                        </span>
                      </div>
                      <Users className="h-4 w-4 text-text-secondary/50 shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-secondary italic">You haven&apos;t joined any cleanup teams yet.</p>
            )}
          </Card>

          {/* Reported Issues */}
          <Card padding="lg" hoverable={false} className="border-border bg-card-opacity-bg rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-primary border-b border-border pb-3 mb-4 flex items-center gap-1.5">
              <Leaf className="h-4 w-4 text-primary" /> Logged Incidents
            </h3>

            {loadingReports ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
            ) : userReports.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {userReports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-xl border border-border bg-bg-inner p-4 flex flex-col justify-between hover:border-primary/20 transition-all gap-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs font-bold text-text-primary truncate leading-tight">{report.title}</p>
                      <span className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        report.status === "resolved"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }`}>
                        {report.status === "resolved" ? "Resolved" : "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-text-secondary border-t border-border pt-2">
                      <span className="capitalize font-mono">{report.category}</span>
                      <span>Severity {report.severity}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-secondary/60 italic">You haven&apos;t filed any environmental reports yet.</p>
            )}
          </Card>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border-strong rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowEdit(false);
                setImageFile(null);
                setImagePreview("");
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary border-b border-border pb-3 mb-4">
              Edit Volunteer Profile
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label="Display Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary/70">Volunteer Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  maxLength={180}
                  placeholder="Share a tagline about your environmental focus..."
                  className="w-full rounded-xl border border-border-strong bg-bg-inner px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary/50 resize-none"
                />
              </div>

              {/* Profile Picture Uploader */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary/70">Profile Avatar</label>
                <div className="flex items-center gap-4 bg-bg-inner border border-border rounded-xl p-3.5">
                  <div className="h-16 w-16 rounded-xl bg-card-opacity-bg flex items-center justify-center font-bold text-primary text-xl shrink-0 overflow-hidden border border-border">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : editPhotoURL ? (
                      <img src={editPhotoURL} alt="Current" className="h-full w-full object-cover" />
                    ) : (
                      editName.charAt(0).toUpperCase() || "V"
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="profile-pic-file"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-pic-file"
                      className="inline-flex items-center justify-center px-3 py-1.5 border border-border rounded-lg text-xs font-bold bg-card text-text-primary hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      Choose Photo
                    </label>
                    <p className="text-[9px] text-text-secondary/40 truncate">PNG, JPG or GIF up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* GPS coordinates & Detect Location */}
              <div className="space-y-3 pt-1">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Active Latitude"
                    type="number"
                    step="0.000001"
                    value={editLat}
                    onChange={(e) => setEditLat(e.target.value)}
                    placeholder="e.g. 28.6139"
                  />
                  <Input
                    label="Active Longitude"
                    type="number"
                    step="0.000001"
                    value={editLng}
                    onChange={(e) => setEditLng(e.target.value)}
                    placeholder="e.g. 77.2090"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full flex items-center justify-center gap-1.5 font-semibold text-xs py-2"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                >
                  {detectingLocation ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <MapPin className="h-3.5 w-3.5" />
                  )}
                  {detectingLocation ? "Detecting GPS..." : "Register Staging Coordinates"}
                </Button>
              </div>

              {error && <p className="text-xs text-danger font-medium">{error}</p>}

              <div className="flex justify-end gap-2 border-t border-border pt-4 mt-4">
                <Button type="button" variant="ghost" onClick={() => setShowEdit(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
