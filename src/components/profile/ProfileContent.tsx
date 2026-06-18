"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { getBadgeDefinition, BADGE_DEFINITIONS } from "@/utils/badges";

const tabs = ["Impact", "Badges", "Activity"] as const;

export function ProfileContent() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Impact");

  const earnedBadges = profile?.badges ?? [];

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <Card padding="lg" className="flex flex-col items-center text-center sm:flex-row sm:text-left">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
          {profile?.name?.charAt(0).toUpperCase() ?? "G"}
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-6">
          <h1 className="text-2xl font-semibold">{profile?.name ?? "Volunteer"}</h1>
          <p className="text-text-secondary">{profile?.email}</p>
          <p className="mt-1 text-sm capitalize text-text-secondary">{profile?.city}</p>
        </div>
        <div className="mt-4 flex gap-6 sm:ml-auto sm:mt-0">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{profile?.ecoScore ?? 0}</p>
            <p className="text-xs text-text-secondary">Eco Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{profile?.joinedTeams?.length ?? 0}</p>
            <p className="text-xs text-text-secondary">Teams</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-primary text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Impact" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><p className="text-sm text-text-secondary">Issues Reported</p><p className="mt-1 text-xl font-semibold">{profile?.reportsCount ?? 0}</p></Card>
          <Card><p className="text-sm text-text-secondary">Issues Resolved</p><p className="mt-1 text-xl font-semibold">{profile?.resolvedCount ?? 0}</p></Card>
          <Card><p className="text-sm text-text-secondary">Verifications</p><p className="mt-1 text-xl font-semibold">{profile?.verificationsCount ?? 0}</p></Card>
          <Card><p className="text-sm text-text-secondary">Community Rank</p><p className="mt-1 text-xl font-semibold">#{Math.max(1, 100 - (profile?.ecoScore ?? 0))}</p></Card>
        </div>
      )}

      {activeTab === "Badges" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_DEFINITIONS.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <Card
                key={badge.id}
                className={earned ? "border-primary/40" : "opacity-50"}
              >
                <span className="text-2xl">{badge.emoji}</span>
                <h3 className="mt-2 font-medium">{badge.name}</h3>
                <p className="text-sm text-text-secondary">{badge.description}</p>
                {earned && <p className="mt-2 text-xs text-primary">Earned</p>}
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === "Activity" && (
        <Card>
          <div className="space-y-3 text-sm">
            <p>Teams joined: {profile?.joinedTeams?.length ?? 0}</p>
            {profile?.joinedTeams?.map((teamId) => (
              <p key={teamId} className="text-text-secondary">Team ID: {teamId}</p>
            ))}
            {earnedBadges.map((id) => {
              const badge = getBadgeDefinition(id);
              return badge ? (
                <p key={id}>{badge.emoji} Earned {badge.name}</p>
              ) : null;
            })}
            {!profile?.joinedTeams?.length && !earnedBadges.length && (
              <p className="text-text-secondary">No activity yet. Start by reporting an issue!</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
