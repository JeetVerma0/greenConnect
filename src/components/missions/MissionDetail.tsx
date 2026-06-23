"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Users, MapPin, Calendar, Clock, MessageSquare, Send, Link as LinkIcon, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, CategoryBadge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { joinMission, createMissionMessage, subscribeMissionMessages, getTeamMissions } from "@/lib/firestore";
import type { Mission } from "@/types/mission";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MissionDetailProps {
  initialMission: Mission;
}

export function MissionDetail({ initialMission }: MissionDetailProps) {
  const { firebaseUser, profile } = useAuth();
  const router = useRouter();
  const [mission, setMission] = useState<Mission>(initialMission);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const isMember = firebaseUser ? mission.joinedVolunteers.includes(firebaseUser.uid) : false;

  useEffect(() => {
    const unsubscribe = subscribeMissionMessages(mission.id, setMessages);
    return () => unsubscribe();
  }, [mission.id]);

  const handleJoin = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    try {
      await joinMission(mission.id, firebaseUser.uid);
      setMission({ ...mission, joinedVolunteers: [...mission.joinedVolunteers, firebaseUser.uid] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser || !messageText.trim()) return;
    setSending(true);
    const senderName = profile?.name || "Volunteer";
    try {
      await createMissionMessage(mission.id, firebaseUser.uid, senderName, messageText.trim());
      setMessageText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-8 max-w-4xl mx-auto pb-16">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <Card padding="lg" className="border-border bg-surface">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4 border-b border-border pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight text-text-primary">{mission.title}</h1>
              <CategoryBadge category={mission.category as any} />
              <StatusBadge status={mission.status} />
            </div>
            <p className="text-text-secondary">{mission.description}</p>
          </div>
          <div className="shrink-0 text-center">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center mb-2">
              <div className="text-2xl font-bold text-primary">{mission.joinedVolunteers.length} / {mission.volunteersNeeded}</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-primary/80">Volunteers</div>
            </div>
            {!isMember ? (
              <Button onClick={handleJoin} disabled={loading || mission.joinedVolunteers.length >= mission.volunteersNeeded} className="w-full">
                {mission.joinedVolunteers.length >= mission.volunteersNeeded ? "Mission Full" : "Join Mission"}
              </Button>
            ) : (
              <div className="text-xs font-bold text-emerald-500 bg-emerald-500/10 py-2 rounded-lg border border-emerald-500/20">
                ✓ You have joined
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-2">
          <div className="space-y-1">
            <span className="text-[10px] text-text-secondary uppercase font-bold flex items-center gap-1"><Calendar className="h-3 w-3"/> Date</span>
            <span className="text-sm font-semibold">{mission.date}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-text-secondary uppercase font-bold flex items-center gap-1"><Clock className="h-3 w-3"/> Time</span>
            <span className="text-sm font-semibold">{mission.startTime}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-text-secondary uppercase font-bold flex items-center gap-1"><MapPin className="h-3 w-3"/> Location</span>
            <span className="text-sm font-semibold">{mission.location}</span>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-text-secondary uppercase font-bold flex items-center gap-1"><LinkIcon className="h-3 w-3"/> Reference</span>
            <Link href={`/reports/${mission.reportId}`} className="text-sm font-semibold text-primary hover:underline">
              View Original Report
            </Link>
          </div>
        </div>
      </Card>

      <Card padding="lg" className="border-border">
        <h2 className="font-semibold text-lg flex items-center gap-2 border-b border-border pb-4 mb-4">
          <MessageSquare className="h-5 w-5 text-primary" />
          Mission Updates & Discussion
        </h2>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 pr-2">
          {messages.length === 0 ? (
            <p className="text-sm text-text-secondary italic">No updates yet. Start the coordination!</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className="flex gap-3 items-start hover:bg-surface-secondary/20 p-2 rounded-lg transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs shrink-0">
                  {msg.senderName.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-sm text-text-primary">{msg.senderName}</span>
                    <span className="text-[10px] text-text-secondary">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {isMember ? (
          <form onSubmit={handleSendMessage} className="border-t border-border pt-4 flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder="Share updates, meeting points, or equipment needed..."
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/60 outline-none focus:border-primary"
            />
            <Button type="submit" disabled={sending || !messageText.trim()} className="px-4">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        ) : (
          <div className="border-t border-border pt-4">
            <p className="text-sm text-text-secondary text-center">Join the mission to participate in the discussion.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
