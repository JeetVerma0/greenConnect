"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge, CategoryBadge } from "@/components/ui/Badge";
import { verifyReport, resolveReport, addProgressUpdate, assignReportToTeam, getTeams, getMissionById } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import type { Report } from "@/types/report";
import type { Team } from "@/types/team";
import type { Mission } from "@/types/mission";
import { CheckCircle2, ShieldCheck, Clock, Image as ImageIcon } from "lucide-react";

interface ReportDetailProps {
  report: Report;
  teamName?: string;
  onUpdate?: () => Promise<void>;
}

export function ReportDetail({ report, teamName, onUpdate }: ReportDetailProps) {
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [afterFile, setAfterFile] = useState<File | null>(null);

  // Team Assignment State
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [assignedTeamObj, setAssignedTeamObj] = useState<Team | null>(null);
  const [linkedMissionObj, setLinkedMissionObj] = useState<Mission | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  useEffect(() => {
    if (profile?.joinedTeams && profile.joinedTeams.length > 0) {
      getTeams().then(allTeams => {
        const userTeams = allTeams.filter(t => profile.joinedTeams.includes(t.id));
        setMyTeams(userTeams);
        if (userTeams.length > 0) setSelectedTeamId(userTeams[0].id);

        if (report.assignedTeam) {
           const aTeam = allTeams.find(t => t.id === report.assignedTeam);
           if (aTeam) setAssignedTeamObj(aTeam);
        }
      }).catch(err => console.error("Failed to load teams", err));
    } else if (report.assignedTeam) {
       getTeams().then(allTeams => {
          const aTeam = allTeams.find(t => t.id === report.assignedTeam);
          if (aTeam) setAssignedTeamObj(aTeam);
       });
    }

    if (report.linkedMission) {
      getMissionById(report.linkedMission).then(m => {
        if (m) setLinkedMissionObj(m);
      });
    }
  }, [profile, report.assignedTeam, report.linkedMission]);

  // Progress Update State
  const [progressFile, setProgressFile] = useState<File | null>(null);
  const [progressDesc, setProgressDesc] = useState("");

  const processImage = async (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.7));
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleAssign = async () => {
    if (!selectedTeamId || report.id.startsWith("mock-")) {
      setError("Cannot assign mock reports or no team selected");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await assignReportToTeam(report.id, selectedTeamId);
      await refreshProfile();
      if (onUpdate) await onUpdate();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign team");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (type: "progress" | "resolution") => {
    if (!firebaseUser || report.id.startsWith("mock-")) {
      setError("Verification requires a live report from Firestore");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyReport(report.id, firebaseUser.uid, type);
      await refreshProfile();
      if (onUpdate) await onUpdate();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!firebaseUser || !afterFile) return;
    if (report.id.startsWith("mock-")) {
      setError("Resolution requires a live report from Firestore");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url = await processImage(afterFile);
      await resolveReport(report.id, firebaseUser.uid, url);
      await refreshProfile();
      if (onUpdate) await onUpdate();
      setAfterFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resolution failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgress = async () => {
    if (!firebaseUser || !progressFile || !progressDesc.trim()) return;
    if (report.id.startsWith("mock-")) {
      setError("Updates require a live report from Firestore");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url = await processImage(progressFile);
      await addProgressUpdate(report.id, firebaseUser.uid, url, progressDesc);
      await refreshProfile();
      if (onUpdate) await onUpdate();
      setProgressFile(null);
      setProgressDesc("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Progress update failed");
    } finally {
      setLoading(false);
    }
  };

  const resolutionThreshold = 10;
  const progressUpdates = report.progressUpdates || [];

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          <CategoryBadge category={report.category} />
        </div>
        <h1 className="mt-3 text-2xl font-semibold">{report.title}</h1>
        <p className="mt-2 text-text-secondary">{report.description}</p>
      </div>

      {/* Info Grid */}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-text-secondary">Location</p>
            <p className="font-medium">
              {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Assigned Team</p>
            <p className="font-medium">{teamName ?? report.assignedTeam ?? "Unassigned"}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Severity</p>
            <p className="font-medium">{report.severity}/5</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Verifications</p>
            <p className="font-medium">
              {report.verificationCount} {report.status === "awaiting_verification" ? `/ ${resolutionThreshold}` : ""}
            </p>
          </div>
        </div>
      </Card>

      {/* Community Verification / Status Flow */}
      <Card className="border border-primary/20 bg-primary/5">
        <h2 className="font-medium text-lg mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Community Verification
        </h2>
        
        {report.assignedTeam && (
          <Card className="border-border bg-primary/5 mt-4">
            <h3 className="font-semibold text-sm mb-2 text-primary">Assignment Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary block text-xs uppercase tracking-wider font-bold mb-0.5">Assigned Team</span>
                <span className="font-semibold">{assignedTeamObj ? assignedTeamObj.name : "Loading..."}</span>
              </div>
              {linkedMissionObj && (
                <div>
                  <span className="text-text-secondary block text-xs uppercase tracking-wider font-bold mb-0.5">Mission</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{linkedMissionObj.title}</span>
                    <Link href={`/missions/${linkedMissionObj.id}`} className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-bold hover:bg-primary/30 transition-colors">
                      View
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
        
        {report.status === "awaiting_verification" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Resolution Verification Progress</span>
              <span className="text-sm font-bold text-primary">{report.verificationCount} / {resolutionThreshold}</span>
            </div>
            <div className="h-2 w-full bg-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all" 
                style={{ width: `${Math.min(100, (report.verificationCount / resolutionThreshold) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-text-secondary">
              This issue requires {resolutionThreshold} community verifications to be marked as officially resolved.
            </p>
            <Button onClick={() => handleVerify("resolution")} disabled={loading} className="w-full sm:w-auto mt-2">
              ✓ Resolution Verified
            </Button>
          </div>
        )}

        {(report.status === "in_progress" || report.status === "assigned" || report.status === "open") && (
          <div className="space-y-2">
            <p className="text-sm text-text-secondary mb-3">
              Verify that work is genuinely happening or that this issue is valid.
            </p>
            <Button onClick={() => handleVerify("progress")} disabled={loading} variant="secondary" className="w-full sm:w-auto">
              ✓ Progress Verified
            </Button>
          </div>
        )}

        {report.status === "verified_resolution" && (
          <div className="flex items-center gap-2 text-primary font-medium">
            <CheckCircle2 className="h-5 w-5" />
            Officially Verified & Resolved by the Community
          </div>
        )}
      </Card>

      {/* Progress Timeline Gallery */}
      <div>
        <h2 className="font-medium text-lg border-b border-border pb-2 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Progress Timeline
        </h2>
        
        <div className="space-y-6">
          {/* Baseline Issue */}
          <div className="relative pl-6 border-l-2 border-border/50">
            <div className="absolute w-3 h-3 bg-card border-2 border-primary rounded-full -left-[7px] top-1" />
            <span className="text-xs font-bold text-primary uppercase">Issue Reported</span>
            <div className="mt-2 p-3 bg-card-opacity-bg rounded-lg border border-border">
              {report.imageBefore ? (
                <img src={report.imageBefore} alt="Baseline" className="w-full h-48 object-cover rounded-md mb-2" />
              ) : (
                <div className="w-full h-32 bg-surface rounded-md flex items-center justify-center mb-2">
                  <ImageIcon className="h-8 w-8 text-text-secondary/30" />
                </div>
              )}
              <p className="text-sm">{report.description}</p>
            </div>
          </div>

          {/* Updates */}
          {progressUpdates.map((update, idx) => (
            <div key={update.id} className="relative pl-6 border-l-2 border-border/50">
              <div className="absolute w-3 h-3 bg-card border-2 border-blue-400 rounded-full -left-[7px] top-1" />
              <span className="text-xs font-bold text-blue-400 uppercase">Day {idx + 1} Progress</span>
              <div className="mt-2 p-3 bg-card-opacity-bg rounded-lg border border-border flex flex-col sm:flex-row gap-4">
                {update.photoURL && (
                  <img src={update.photoURL} alt="Progress" className="w-full sm:w-48 h-32 object-cover rounded-md" />
                )}
                <div>
                  <p className="text-sm font-medium">{update.description}</p>
                  {update.progressNotes && <p className="text-sm text-text-secondary mt-1">{update.progressNotes}</p>}
                  <p className="text-xs text-text-secondary mt-2">
                    {new Date(update.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Final Resolution Image */}
          {report.imageAfter && (
            <div className="relative pl-6 border-l-2 border-emerald-500/30">
              <div className="absolute w-3 h-3 bg-card border-2 border-emerald-500 rounded-full -left-[7px] top-1" />
              <span className="text-xs font-bold text-emerald-500 uppercase">Final Cleanup Proof</span>
              <div className="mt-2 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                <img src={report.imageAfter} alt="Resolved" className="w-full h-48 object-cover rounded-md mb-2" />
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Area fully restored and cleaned.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Actions */}
      {report.status === "open" && profile?.joinedTeams && profile.joinedTeams.length > 0 && (
        <Card className="space-y-4 border-blue-500/30 bg-blue-500/5">
          <h2 className="font-medium text-lg border-b border-blue-500/20 pb-2">Opt-in / Accept Mission</h2>
          <div className="pt-2">
            <h3 className="font-medium mb-1 text-sm">Take Responsibility for Team</h3>
            <p className="mb-3 text-xs text-text-secondary">
              Select one of your teams to take responsibility for this cleanup. This will mark the issue as Assigned.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={selectedTeamId} 
                onChange={e => setSelectedTeamId(e.target.value)}
                className="w-full sm:w-auto rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
              >
                {myTeams.map(t => <option key={t.id} value={t.id} className="bg-surface text-text-primary">{t.name}</option>)}
              </select>
              <Button onClick={handleAssign} disabled={loading || !selectedTeamId} size="sm">
                Accept Mission
              </Button>
            </div>
            {error && <p className="text-sm text-danger mt-2">{error}</p>}
          </div>
        </Card>
      )}

      {(report.status === "assigned" || report.status === "in_progress") && (
        <Card className="space-y-4">
          <h2 className="font-medium text-lg border-b border-border pb-2">Team Actions</h2>
          
          <div className="pt-2">
            <h3 className="font-medium mb-1 text-sm">Add Progress Update</h3>
            <p className="mb-3 text-xs text-text-secondary">
              Log multiple visits and ongoing work with photos.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Description (e.g. Removed 20 bags of waste)"
                value={progressDesc}
                onChange={(e) => setProgressDesc(e.target.value)}
                className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProgressFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary"
              />
              <Button onClick={handleAddProgress} disabled={loading || !progressFile || !progressDesc} size="sm">
                Upload Progress
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-medium mb-1 text-sm">Submit Final Resolution</h3>
            <p className="mb-3 text-xs text-text-secondary">
              Upload the final proof of cleanup to send this issue for community verification.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAfterFile(e.target.files?.[0] ?? null)}
              className="mb-3 block w-full text-sm text-text-secondary file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-primary"
            />
            <Button onClick={handleResolve} disabled={loading || !afterFile} variant="secondary" size="sm">
              Submit for Verification
            </Button>
          </div>
          
          {error && <p className="text-sm text-danger mt-2">{error}</p>}
        </Card>
      )}
    </div>
  );
}
