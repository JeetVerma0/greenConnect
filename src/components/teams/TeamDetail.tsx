"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Users,
  MapPin,
  MessageSquare,
  AlertTriangle,
  Megaphone,
  Crown,
  Send,
  Lock,
  Loader2,
  Calendar,
  LogOut,
  UserPlus,
  Inbox,
  Target,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CategoryBadge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import {
  getMultipleUserProfiles,
  createTeamMessage,
  subscribeTeamMessages,
  joinTeam,
  leaveTeam,
  subscribeReports,
  getTeamMissions,
  rejectReport,
  createMission,
} from "@/lib/firestore";
import type { Team, TeamMessage } from "@/types/team";
import type { UserProfile } from "@/types/user";
import type { Report } from "@/types/report";
import type { Mission } from "@/types/mission";
import { distanceInKm } from "@/utils/distance";

interface TeamDetailProps {
  team: Team;
  onBack: () => void;
  onRefresh: () => void;
}

type MessageFilter = "all" | "chat" | "alert" | "campaign";

const MOCK_MESSAGES: Record<string, TeamMessage[]> = {
  "mock-team-1": [
    {
      id: "mmsg-1",
      teamId: "mock-team-1",
      senderId: "another-user",
      senderName: "Aarav Sharma",
      content: "Hey team! Glad to join the Green Delhi Warriors.",
      type: "chat",
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
    {
      id: "mmsg-2",
      teamId: "mock-team-1",
      senderId: "demo",
      senderName: "Demo Volunteer",
      content: "Welcome Aarav! We have a major cleanup planned for this weekend.",
      type: "chat",
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: "mmsg-3",
      teamId: "mock-team-1",
      senderId: "another-user-2",
      senderName: "Priya Patel",
      content: "Severe trash build-up reported near the metro station exit. Let's address this first.",
      type: "alert",
      createdAt: new Date(Date.now() - 1800000),
    },
  ],
  "mock-team-2": [
    {
      id: "mmsg-4",
      teamId: "mock-team-2",
      senderId: "demo",
      senderName: "Demo Volunteer",
      content: "Welcome to River Guardians! Let's protect our local waterways.",
      type: "chat",
      createdAt: new Date(Date.now() - 3600000 * 5),
    },
    {
      id: "mmsg-5",
      teamId: "mock-team-2",
      senderId: "water-watcher",
      senderName: "Rahul Verma",
      content: "River cleaning campaign scheduled near the bank this Saturday at 8 AM. Bring gloves!",
      type: "campaign",
      createdAt: new Date(Date.now() - 3600000 * 3),
    },
  ],
};

export function TeamDetail({ team: initialTeam, onBack, onRefresh }: TeamDetailProps) {
  const { firebaseUser, profile, refreshProfile } = useAuth();
  const [team, setTeam] = useState<Team>(initialTeam);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageType, setMessageType] = useState<"chat" | "alert" | "campaign">("chat");
  const [filter, setFilter] = useState<MessageFilter>("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [messageError, setMessageError] = useState("");

  const [activeTab, setActiveTab] = useState<"hub" | "inbox" | "missions">("hub");
  const [incomingReports, setIncomingReports] = useState<Report[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);

  // Mission Creation Form State
  const [showReportSelector, setShowReportSelector] = useState(false);
  const [showCreateMissionFor, setShowCreateMissionFor] = useState<Report | null>(null);
  const [missionForm, setMissionForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    volunteersNeeded: 5,
    expectedDuration: 2,
  });

  // Robust membership checks: check both direct team members list and profile joinedTeams array
  const isMember =
    (firebaseUser && team.members?.includes(firebaseUser.uid)) ||
    (profile?.joinedTeams?.includes(team.id)) ||
    false;

  // Track the current team state locally when operations happen
  useEffect(() => {
    setTeam(initialTeam);
  }, [initialTeam]);

  // Load team member profiles
  useEffect(() => {
    if (!team.members || team.members.length === 0) {
      setMembers([]);
      return;
    }

    setLoadingMembers(true);
    getMultipleUserProfiles(team.members)
      .then(setMembers)
      .finally(() => setLoadingMembers(false));
  }, [team.members]);

  // Subscribe to real-time team messages or load mock messages
  useEffect(() => {
    if (!isMember) {
      setMessages([]);
      return;
    }

    if (team.id.startsWith("mock-")) {
      setMessages(MOCK_MESSAGES[team.id] || []);
      return;
    }

    const unsubscribe = subscribeTeamMessages(
      team.id,
      (msgs) => {
        setMessages(msgs);
        setMessageError("");
      },
      (err) => {
        console.error("Failed to load real-time messages:", err);
        setMessageError(`Database read error: ${err.message}`);
      }
    );

    return () => unsubscribe();
  }, [team.id, isMember]);

  // Load incoming reports and team missions
  useEffect(() => {
    if (team.id.startsWith("mock-")) return;

    const unsubReports = subscribeReports((allReports) => {
      const incoming = allReports.filter(r => 
        (
          (r.status === "open" && !r.rejectedBy?.includes(team.id)) ||
          (r.status === "assigned" && r.assignedTeam === team.id)
        ) &&
        !r.linkedMission
      );
      setIncomingReports(incoming);
    });

    const loadMissions = async () => {
      try {
        const tMissions = await getTeamMissions(team.id);
        setMissions(tMissions);
      } catch (err) {
        console.error("Failed to load missions", err);
      }
    };
    loadMissions();

    return () => unsubReports();
  }, [team.id]);

  const handleRejectReport = async (reportId: string) => {
    if (team.id.startsWith("mock-")) return;
    setActionLoading(true);
    try {
      await rejectReport(reportId, team.id);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !showCreateMissionFor || team.id.startsWith("mock-")) return;
    
    setActionLoading(true);
    try {
      const newMission = await createMission({
        title: missionForm.title,
        description: missionForm.description,
        date: missionForm.date,
        startTime: missionForm.startTime,
        location: `Near ${showCreateMissionFor.latitude.toFixed(3)}, ${showCreateMissionFor.longitude.toFixed(3)}`,
        reportId: showCreateMissionFor.id,
        teamId: team.id,
        category: team.category,
        volunteersNeeded: Number(missionForm.volunteersNeeded)
      }, firebaseUser.uid);
      
      setMissions(prev => [newMission, ...prev]);
      setShowCreateMissionFor(null);
      setMissionForm({ title: "", description: "", date: "", startTime: "", volunteersNeeded: 5, expectedDuration: 2 });
      setActiveTab("missions");
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!firebaseUser) return;
    setActionLoading(true);
    try {
      if (!team.id.startsWith("mock-")) {
        await joinTeam(team.id, firebaseUser.uid);
      }
      
      // Update local state to feel immediate
      const updatedMembers = [...team.members, firebaseUser.uid];
      setTeam({ ...team, members: updatedMembers });
      
      await refreshProfile();
      onRefresh();
    } catch (err) {
      console.error("Failed to join team:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!firebaseUser) return;
    setActionLoading(true);
    try {
      if (!team.id.startsWith("mock-")) {
        await leaveTeam(team.id, firebaseUser.uid);
      }
      
      // Update local state
      const updatedMembers = team.members.filter((m) => m !== firebaseUser.uid);
      setTeam({ ...team, members: updatedMembers });
      
      await refreshProfile();
      onRefresh();
    } catch (err) {
      console.error("Failed to leave team:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !messageText.trim() || !isMember) return;

    setSending(true);
    const senderName = profile?.name || firebaseUser.displayName || "Volunteer";

    try {
      if (team.id.startsWith("mock-")) {
        // Simulate posting on a mock team locally
        const newMessage: TeamMessage = {
          id: `mmsg-mock-${Date.now()}`,
          teamId: team.id,
          senderId: firebaseUser.uid,
          senderName,
          content: messageText.trim(),
          type: messageType,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
        setMessageText("");
        setMessageError("");
      } else {
        await createTeamMessage(team.id, firebaseUser.uid, senderName, messageText.trim(), messageType);
        setMessageText("");
        setMessageError("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessageError(`Failed to send message: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    if (filter === "all") return true;
    return msg.type === filter;
  });

  const successRate =
    team.issuesResolved && team.members.length
      ? Math.min(100, Math.round((team.issuesResolved / team.members.length) * 10))
      : 0;

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors duration-150"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Teams
      </button>

      {/* Hero card */}
      <Card padding="lg" className="relative overflow-hidden border-border bg-surface">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-text-primary">{team.name}</h1>
              <CategoryBadge category={team.category} />
            </div>
            <p className="text-base text-text-secondary max-w-2xl">{team.description}</p>
          </div>
          <div className="flex gap-2">
            {isMember ? (
              <Button
                variant="secondary"
                onClick={handleLeave}
                disabled={actionLoading}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Leave Team
              </Button>
            ) : (
              <Button
                onClick={handleJoin}
                disabled={actionLoading}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Join Team
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase">Members</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">{team.members.length}</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase">Coverage Radius</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">{team.radiusKm}</span>
            <span className="text-sm font-semibold text-text-secondary">km</span>
            <MapPin className="h-4 w-4 text-primary" />
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase">Issues Resolved</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">{team.issuesResolved ?? 0}</span>
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <span className="text-xs font-semibold text-text-secondary uppercase">Success Rate</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-text-primary">{successRate}%</span>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Main Feed Container (Columns 1 & 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 overflow-x-auto border-b border-border pb-0.5 scrollbar-none mb-2">
            {(["hub", "inbox", "missions"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-xs font-semibold tracking-wide transition-all border-b-2 ${
                  activeTab === tab
                    ? "text-primary border-primary font-semibold"
                    : "text-text-secondary border-transparent hover:text-text-primary"
                }`}
              >
                {tab === "hub" ? "Team Hub" : tab === "inbox" ? `Incoming Reports (${incomingReports.length})` : "Active Missions"}
              </button>
            ))}
          </div>

          <Card padding="lg" className="flex flex-col min-h-[600px] relative overflow-hidden border-border bg-card">
            {activeTab === "hub" && (
              <>
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Team Hub
                  </h2>
                  <div className="flex items-center gap-4">
                    {/* Feed Filters */}
                    {isMember && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => { setShowReportSelector(true); setActiveTab("inbox"); }}
                        >
                          Create Mission
                        </Button>
                        <div className="flex gap-1.5 overflow-x-auto text-xs hidden sm:flex">
                          {(["all", "chat", "alert", "campaign"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setFilter(t)}
                              className={`rounded-full px-3 py-1 font-medium capitalize border transition-all ${
                                filter === t
                                  ? "bg-primary text-background border-primary"
                                  : "bg-surface border-border text-text-secondary hover:text-text-primary"
                              }`}
                            >
                              {t === "all" ? "All Feed" : t + "s"}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

            {/* If the current user is not a member, block feed view with premium overlay */}
            {!isMember ? (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/85 backdrop-blur-[6px] p-6 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
                  <Lock className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-text-primary">Communication Locked</h3>
                <p className="text-sm text-text-secondary max-w-sm mt-2 mb-6">
                  Join the <strong>{team.name}</strong> team to see exclusive announcements, start alerts, post campaign events, and talk with other volunteers.
                </p>
                <Button onClick={handleJoin} disabled={actionLoading} className="flex items-center gap-2">
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  Join Team Now
                </Button>
              </div>
            ) : null}

            {/* Messages feed area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-text-secondary py-12">
                  <MessageSquare className="h-10 w-10 text-border mb-2" />
                  <p className="text-sm">No messages, alerts, or campaigns in this filter yet.</p>
                </div>
              ) : (
                filteredMessages.map((msg) => {
                  const initials = msg.senderName.charAt(0).toUpperCase();
                  const timeString = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "";

                  if (msg.type === "alert") {
                    return (
                      <div key={msg.id} className="border-l-4 border-danger bg-danger/5 rounded-r-lg p-4 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5 animate-bounce" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-text-primary">{msg.senderName}</span>
                            <span className="rounded bg-danger/10 border border-danger/20 text-danger text-[10px] font-bold px-1.5 py-0.5 uppercase">
                              Alert
                            </span>
                            <span className="text-[10px] text-text-secondary">{timeString}</span>
                          </div>
                          <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  }

                  if (msg.type === "campaign") {
                    return (
                      <div key={msg.id} className="border-l-4 border-primary bg-primary/5 rounded-r-lg p-4 flex gap-3">
                        <Megaphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-text-primary">{msg.senderName}</span>
                            <span className="rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 uppercase">
                              Campaign
                            </span>
                            <span className="text-[10px] text-text-secondary">{timeString}</span>
                          </div>
                          <p className="text-sm text-text-primary whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="flex gap-3 items-start hover:bg-surface-secondary/20 p-2 rounded-lg transition-colors">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                        {initials}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm text-text-primary">{msg.senderName}</span>
                          <span className="text-[10px] text-text-secondary">{timeString}</span>
                        </div>
                        <p className="text-sm text-text-secondary whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Compose Message Form */}
            {isMember && (
              <form onSubmit={handleSendMessage} className="border-t border-border pt-4 mt-4 space-y-3">
                {messageError && (
                  <p className="text-xs text-danger font-semibold bg-danger/10 border border-danger/20 rounded p-2 mb-2">
                    ⚠️ {messageError}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">Post Type:</span>
                  <div className="flex gap-1.5">
                    {(["chat", "alert", "campaign"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMessageType(t)}
                        className={`rounded px-2.5 py-1 text-xs font-semibold flex items-center gap-1 border transition-all ${
                          messageType === t
                            ? t === "chat"
                              ? "bg-primary/15 text-primary border-primary/30"
                              : t === "alert"
                              ? "bg-danger/15 text-danger border-danger/30"
                              : "bg-primary/20 text-primary border-primary/40"
                            : "bg-surface border-border text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        {t === "chat" && <MessageSquare className="h-3 w-3" />}
                        {t === "alert" && <AlertTriangle className="h-3 w-3" />}
                        {t === "campaign" && <Megaphone className="h-3 w-3" />}
                        {t === "chat" ? "Chat" : t === "alert" ? "Alert" : "Campaign"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder={
                      messageType === "chat"
                        ? "Discuss cleanups and coordinate..."
                        : messageType === "alert"
                        ? "Share an urgent environmental alert with team members..."
                        : "Plan a campaign drive, specify location and time..."
                    }
                    className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-primary resize-none"
                    required
                  />
                  <Button type="submit" disabled={sending || !messageText.trim()} className="self-end px-3 py-3 h-10 w-10">
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </form>
            )}
            </>
            )}

            {/* TEAM INBOX TAB */}
            {activeTab === "inbox" && (
              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Inbox className="h-5 w-5 text-primary" />
                    Incoming Reports
                  </h2>
                </div>
                {!isMember ? (
                   <p className="text-sm text-text-secondary text-center py-8">Join the team to view incoming reports.</p>
                ) : showCreateMissionFor ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">Create Mission</h3>
                      <Button variant="ghost" size="sm" onClick={() => { setShowCreateMissionFor(null); setShowReportSelector(false); }}>Cancel</Button>
                    </div>
                    <form onSubmit={handleCreateMission} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-text-secondary">Mission Title</label>
                        <input type="text" value={missionForm.title} onChange={e => setMissionForm({...missionForm, title: e.target.value})} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-secondary">Mission Description</label>
                        <textarea value={missionForm.description} onChange={e => setMissionForm({...missionForm, description: e.target.value})} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-text-secondary">Date</label>
                          <input type="date" value={missionForm.date} onChange={e => setMissionForm({...missionForm, date: e.target.value})} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-text-secondary">Start Time</label>
                          <input type="time" value={missionForm.startTime} onChange={e => setMissionForm({...missionForm, startTime: e.target.value})} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-text-secondary">Volunteers Needed</label>
                        <input type="number" min="1" value={missionForm.volunteersNeeded} onChange={e => setMissionForm({...missionForm, volunteersNeeded: Number(e.target.value)})} required className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary" />
                      </div>
                      <Button type="submit" disabled={actionLoading} className="w-full">Create Mission</Button>
                    </form>
                  </div>
                ) : incomingReports.length === 0 ? (
                  <p className="text-sm text-text-secondary text-center py-8">No incoming reports available.</p>
                ) : (
                  incomingReports.map(report => (
                    <div key={report.id} className="border border-border rounded-lg p-4 bg-surface hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-text-primary">{report.title}</h3>
                          <p className="text-xs text-text-secondary mt-1">{report.description}</p>
                        </div>
                        <CategoryBadge category={report.category} />
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-text-secondary my-3 font-semibold">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {distanceInKm({lat: report.latitude, lng: report.longitude}, {lat: team.latitude, lng: team.longitude}).toFixed(1)} km away</span>
                        <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Severity {report.severity}</span>
                      </div>
                      <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-border">
                        <Button variant="secondary" size="sm" onClick={() => handleRejectReport(report.id)} disabled={actionLoading}>
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button size="sm" onClick={() => { setShowCreateMissionFor(report); setMissionForm({...missionForm, title: `Cleanup: ${report.title}`, description: `Mission to address: ${report.description}`}); }}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Choose Report
                        </Button>
                        <Link href={`/reports/${report.id}`} target="_blank">
                           <Button variant="ghost" size="sm">Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MISSIONS TAB */}
            {activeTab === "missions" && (
              <div className="flex-1 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Active Missions
                  </h2>
                </div>
                {missions.length === 0 ? (
                  <p className="text-sm text-text-secondary text-center py-8">No missions created yet. Accept incoming reports to start missions.</p>
                ) : (
                  missions.map(mission => (
                    <div key={mission.id} className="border border-border rounded-lg p-4 bg-surface hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-text-primary">{mission.title}</h3>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary border border-primary/20 px-2 py-0.5 rounded bg-primary/10">{mission.status}</span>
                      </div>
                      <p className="text-xs text-text-secondary mb-3">{mission.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary font-semibold">
                         <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {mission.date} at {mission.startTime}</span>
                         <span className="flex items-center gap-1"><Users className="h-3 w-3"/> {mission.joinedVolunteers.length} / {mission.volunteersNeeded} Volunteers</span>
                      </div>
                      <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-border">
                        <Link href={`/missions/${mission.id}`}>
                           <Button size="sm">View Mission Page</Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </Card>
        </div>

        {/* Directory Sidebar Column 3 */}
        <div className="space-y-4">
          <Card padding="lg" className="border-border bg-card flex flex-col h-full min-h-[400px]">
            <h2 className="font-semibold text-lg flex items-center gap-2 border-b border-border pb-4 mb-4">
              <Users className="h-5 w-5 text-primary" />
              Members Directory
            </h2>

            {loadingMembers ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-xs text-text-secondary mt-2">Loading profiles...</p>
              </div>
            ) : members.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-text-secondary">
                <Users className="h-8 w-8 text-border mb-2" />
                <p className="text-sm">No members registered.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4">
                {members.map((member) => {
                  const mInitials = member.name.charAt(0).toUpperCase();
                  const isUserLeader = member.uid === team.leaderId || member.uid === team.createdBy;

                  return (
                    <div key={member.uid} className="flex items-center gap-3 p-2 rounded-lg border border-border/40 bg-surface/50 hover:bg-surface transition-colors">
                      {member.photoURL ? (
                        <img
                          src={member.photoURL}
                          alt={member.name}
                          className="h-10 w-10 rounded-full object-cover shrink-0"
                          onError={(e) => {
                            // Fallback to initials if image URL fails to load
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                          {mInitials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm text-text-primary truncate">{member.name}</p>
                          {isUserLeader && (
                            <span
                              title="Team Leader"
                              className="inline-flex items-center justify-center h-4 w-4 rounded bg-amber-500/20 text-amber-500"
                            >
                              <Crown className="h-3 w-3 fill-amber-500" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-primary">{member.ecoScore ?? 0}</p>
                        <p className="text-[10px] text-text-secondary uppercase">Points</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-border pt-4 mt-4">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Total: {team.members.length} members</span>
                {team.leaderId && <span>Leader assigned</span>}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
