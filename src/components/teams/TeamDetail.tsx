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
} from "lucide-react";
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
} from "@/lib/firestore";
import type { Team, TeamMessage } from "@/types/team";
import type { UserProfile } from "@/types/user";

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
          <Card padding="lg" className="flex flex-col h-[600px] relative overflow-hidden border-border bg-card">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Team Hub
              </h2>
              {/* Feed Filters */}
              {isMember && (
                <div className="flex gap-1.5 overflow-x-auto text-xs">
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
              )}
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
