export type TeamCategory =
  | "waste"
  | "pollution"
  | "deforestation"
  | "water"
  | "general";

export interface Team {
  id: string;
  name: string;
  description: string;
  category: TeamCategory;
  radiusKm: number;
  latitude: number;
  longitude: number;
  members: string[];
  createdBy: string;
  issuesResolved?: number;
  createdAt: Date;
}
