export interface BadgeDefinition {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: "first_report", emoji: "🌱", name: "First Report", description: "Submitted your first report" },
  { id: "five_reports", emoji: "📋", name: "5 Reports", description: "Submitted 5 environmental reports" },
  { id: "ten_verifications", emoji: "✅", name: "10 Verifications", description: "Verified 10 community reports" },
  { id: "first_resolution", emoji: "♻️", name: "First Resolution", description: "Resolved your first issue" },
  { id: "team_founder", emoji: "🤝", name: "Team Founder", description: "Created a cleanup team" },
  { id: "eco_100", emoji: "⚡", name: "Eco Champion", description: "Earned 100 eco points" },
];

export function getBadgeDefinition(id: string) {
  return BADGE_DEFINITIONS.find((b) => b.id === id);
}

export function computeBadges(stats: {
  reportsCount: number;
  verificationsCount: number;
  resolvedCount: number;
  teamsCreated: number;
  ecoScore: number;
}): string[] {
  const badges: string[] = [];
  if (stats.reportsCount >= 1) badges.push("first_report");
  if (stats.reportsCount >= 5) badges.push("five_reports");
  if (stats.verificationsCount >= 10) badges.push("ten_verifications");
  if (stats.resolvedCount >= 1) badges.push("first_resolution");
  if (stats.teamsCreated >= 1) badges.push("team_founder");
  if (stats.ecoScore >= 100) badges.push("eco_100");
  return badges;
}
