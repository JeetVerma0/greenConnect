"use client";

import { useState, useEffect } from "react";
import { Edit, MapPin, Award, TrendingUp, X, Leaf, Users, ShieldAlert, Loader2, Map } from "lucide-react";
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
    <div className="space-y-6 p-4 lg:p-8">
      {/* Profile Card */}
      <Card padding="lg" className="relative overflow-hidden border-border bg-card">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center sm:flex-row sm:text-left">
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.name}
              className="h-24 w-24 rounded-full border-2 border-primary object-cover shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-3xl font-bold text-primary shrink-0 border border-primary/25">
              {profile?.name?.charAt(0).toUpperCase() ?? "G"}
            </div>
          )}
          <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-3xl font-bold text-text-primary tracking-tight truncate">{profile?.name ?? "Volunteer"}</h1>
              <span className="inline-flex items-center self-center sm:self-auto gap-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold px-2 py-0.5 mt-0.5">
                {rank.emoji} {rank.name}
              </span>
            </div>
            <p className="text-text-secondary font-medium text-sm mt-1">{profile?.email}</p>
            {profile?.bio && (
              <p className="text-text-secondary text-sm mt-2 max-w-xl italic whitespace-pre-line leading-relaxed">
                &ldquo;{profile.bio}&rdquo;
              </p>
            )}
            
            {/* GPS coordinates if set */}
            {(profile?.latitude || profile?.longitude) && (
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-1.5 text-xs text-text-secondary font-mono">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{profile.latitude?.toFixed(4)}, {profile.longitude?.toFixed(4)}</span>
              </div>
            )}
          </div>
          <div className="mt-6 sm:mt-0 sm:ml-auto flex flex-col items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 w-full font-semibold">
              <Edit className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
            <div className="flex gap-4 border-t border-border/60 pt-3 w-full justify-center">
              <div className="text-center">
                <p className="text-xl font-extrabold text-primary">{profile?.ecoScore ?? 0}</p>
                <p className="text-[10px] font-semibold text-text-secondary uppercase">Eco Score</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-extrabold">{profile?.joinedTeams?.length ?? 0}</p>
                <p className="text-[10px] font-semibold text-text-secondary uppercase">Teams</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB: Impact */}
      {activeTab === "Impact" && (
        <div className="space-y-6">
          {/* Progress bar to next rank */}
          <Card padding="lg" className="border-border bg-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Eco Progress Tier
              </h3>
              <span className="text-xs text-text-secondary font-medium">
                {score} pts / {rank.maxPoints} pts to next rank
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-surface border border-border/80 h-3 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${rankPercent}%` }}
              />
            </div>
            
            <div className="flex items-center justify-between text-xs text-text-secondary mt-2">
              <span className="font-semibold">{rank.emoji} {rank.name}</span>
              {score >= 350 ? (
                <span>🌟 Ultimate Rank Achieved</span>
              ) : (
                <span>Next: {rank.nextName}</span>
              )}
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-xs font-semibold text-text-secondary uppercase">Issues Reported</p>
              <p className="mt-2 text-3xl font-extrabold text-text-primary">{profile?.reportsCount ?? 0}</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold text-text-secondary uppercase">Issues Resolved</p>
              <p className="mt-2 text-3xl font-extrabold text-text-primary">{profile?.resolvedCount ?? 0}</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold text-text-secondary uppercase">Verifications</p>
              <p className="mt-2 text-3xl font-extrabold text-text-primary">{profile?.verificationsCount ?? 0}</p>
            </Card>
            <Card>
              <p className="text-xs font-semibold text-text-secondary uppercase">Community Rank</p>
              <p className="mt-2 text-3xl font-extrabold text-text-primary">
                #{Math.max(1, 100 - (profile?.ecoScore ?? 0))}
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* TAB: Badges */}
      {activeTab === "Badges" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_DEFINITIONS.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <Card
                key={badge.id}
                className={`transition-all duration-200 ${
                  earned ? "border-primary/50 bg-primary/5" : "opacity-55"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{badge.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-text-primary">{badge.name}</h3>
                    <p className="text-xs text-text-secondary">{badge.description}</p>
                  </div>
                </div>
                {earned && (
                  <div className="mt-3 flex items-center justify-between text-xs text-primary font-medium">
                    <span>Earned Badge</span>
                    <span className="rounded-full bg-primary/20 p-0.5 border border-primary/20">
                      ✓
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB: Teams & Activity */}
      {activeTab === "Teams & Activity" && (
        <div className="space-y-6">
          <Card padding="lg">
            <h3 className="font-semibold text-lg flex items-center gap-2 border-b border-border pb-4 mb-4">
              <Users className="h-5 w-5 text-primary" />
              Registered Volunteer Activities
            </h3>

            <div className="space-y-5 text-sm">
              <div>
                <p className="font-medium text-text-primary mb-2.5">Teams Joined ({profile?.joinedTeams?.length ?? 0})</p>
                {profile?.joinedTeams && profile.joinedTeams.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {profile.joinedTeams.map((teamId) => {
                      const matchedTeam = teamsMap[teamId];
                      const teamName = matchedTeam?.name || `Team (ID: ${teamId.slice(0, 8)})`;
                      const category = matchedTeam?.category || "general";

                      return (
                        <div
                          key={teamId}
                          className="rounded-lg border border-border bg-surface p-3.5 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-text-primary truncate">{teamName}</p>
                            <span className="inline-block mt-1 text-[10px] font-semibold uppercase text-text-secondary rounded border border-border bg-card px-1.5 py-0.5">
                              {category}
                            </span>
                          </div>
                          <Users className="h-4 w-4 text-text-secondary shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-text-secondary text-xs italic">You haven&apos;t joined any cleanup teams yet.</p>
                )}
              </div>

              {/* Reported Issues Feed */}
              <div className="border-t border-border/80 pt-5 space-y-3">
                <p className="font-medium text-text-primary text-base">Your Reported Issues ({userReports.length})</p>
                {loadingReports ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 text-primary animate-spin" />
                  </div>
                ) : userReports.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {userReports.map((report) => (
                      <div
                        key={report.id}
                        className="rounded-lg border border-border bg-surface p-3.5 flex flex-col justify-between hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-text-primary truncate">{report.title}</p>
                          <span className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${
                            report.status === "resolved"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-warning/10 text-warning border-warning/20"
                          }`}>
                            {report.status === "resolved" ? "Resolved" : "Pending"}
                          </span>
                        </div>
                        <div className="mt-2.5 flex items-center justify-between text-xs text-text-secondary">
                          <span className="capitalize">Category: {report.category}</span>
                          <span>Severity: {report.severity}/5</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-xs italic">You haven&apos;t filed any environmental reports yet.</p>
                )}
              </div>

              {/* Accomplishments list */}
              <div className="border-t border-border/80 pt-4 space-y-2">
                <p className="font-medium text-text-primary">Accomplishments Log</p>
                {earnedBadges.map((id) => {
                  const badge = getBadgeDefinition(id);
                  return badge ? (
                    <p key={id} className="text-xs text-text-secondary flex items-center gap-2 bg-surface border border-border p-2 rounded-lg">
                      <span className="text-base">{badge.emoji}</span>
                      <span>Earned <strong>{badge.name}</strong> - {badge.description}</span>
                    </p>
                  ) : null;
                })}
                {!profile?.joinedTeams?.length && !earnedBadges.length && (
                  <p className="text-text-secondary text-xs italic">No activity logs recorded. Report an issue or join a team to begin!</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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

            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border pb-3 mb-4">
              <Edit className="h-5 w-5 text-primary" />
              Edit Volunteer Profile
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Input
                label="Display Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-text-secondary">Volunteer Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  maxLength={180}
                  placeholder="Share a short summary or environmental tagline about yourself..."
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Profile Picture Uploader */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-text-secondary font-medium">Profile Picture</label>
                <div className="flex items-center gap-4 bg-surface border border-border rounded-xl p-3">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl shrink-0 overflow-hidden border border-border">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : editPhotoURL ? (
                      <img src={editPhotoURL} alt="Current" className="h-full w-full object-cover" />
                    ) : (
                      editName.charAt(0).toUpperCase() || "V"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="file"
                      accept="image/*"
                      id="profile-pic-file"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="profile-pic-file"
                      className="inline-flex items-center justify-center px-4 py-2 border border-border rounded-lg text-sm font-semibold bg-card text-text-primary hover:bg-surface cursor-pointer transition-colors"
                    >
                      Choose Photo
                    </label>
                    <p className="text-[10px] text-text-secondary mt-1 truncate">PNG, JPG or GIF up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* GPS coordinates & Detect Location */}
              <div className="space-y-2.5">
                <div className="grid gap-4 sm:grid-cols-2">
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
                  className="w-full flex items-center justify-center gap-1.5 font-semibold"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                >
                  {detectingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {detectingLocation ? "Detecting GPS..." : "Detect My GPS Location"}
                </Button>
              </div>

              {error && <p className="text-xs text-danger font-medium">{error}</p>}

              <div className="flex justify-end gap-2 border-t border-border pt-4 mt-2">
                <Button type="button" variant="secondary" onClick={() => setShowEdit(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-4 w-4 animate-spin" />
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
