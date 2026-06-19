import type { Report } from "@/types/report";
import type { Team } from "@/types/team";

export const IMPACT_STATS = {
  reportsFiled: 1247,
  issuesResolved: 892,
  activeVolunteers: 340,
  teamsActive: 56,
};

export const MOCK_REPORTS: Report[] = [
  {
    id: "mock-1",
    title: "Plastic waste near park",
    description: "Large pile of plastic bottles accumulating near the community park entrance.",
    category: "waste",
    severity: 3,
    imageBefore: "https://images.unsplash.com/photo-1532996122720-e3c354a0b782?w=800",
    latitude: 28.6145,
    longitude: 77.2095,
    status: "pending",
    verificationCount: 2,
    createdBy: "demo",
    createdAt: new Date(),
  },
  {
    id: "mock-2",
    title: "Oil spill in drainage",
    description: "Dark oily residue visible in the storm drain near Main Street.",
    category: "pollution",
    severity: 4,
    imageBefore: "https://images.unsplash.com/photo-1611273426858-450d8a3a50ef?w=800",
    imageAfter: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
    latitude: 28.612,
    longitude: 77.215,
    status: "resolved",
    verificationCount: 5,
    createdBy: "demo",
    assignedTeam: "mock-team-1",
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
];

export const MOCK_TEAMS: Team[] = [
  {
    id: "mock-team-1",
    name: "Green Delhi Warriors",
    description: "Community cleanup team focused on waste and pollution in central Delhi.",
    category: "waste",
    radiusKm: 5,
    latitude: 28.6139,
    longitude: 77.209,
    members: ["demo"],
    createdBy: "demo",
    issuesResolved: 12,
    createdAt: new Date(),
  },
  {
    id: "mock-team-2",
    name: "River Guardians",
    description: "Protecting waterways and reporting contamination.",
    category: "water",
    radiusKm: 8,
    latitude: 28.62,
    longitude: 77.22,
    members: [],
    createdBy: "demo",
    issuesResolved: 7,
    createdAt: new Date(),
  },
];
