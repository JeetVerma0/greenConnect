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
  leaderId?: string;
  issuesResolved?: number;
  createdAt: Date;
}

export interface TeamMessage {
  id: string;
  teamId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: "chat" | "alert" | "campaign";
  createdAt: Date;
}

