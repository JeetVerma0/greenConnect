export type MissionStatus = 
  | "upcoming"
  | "in_progress"
  | "awaiting_verification"
  | "completed";

export interface Mission {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  startTime: string; // HH:mm
  location: string;
  reportId: string;
  teamId: string;
  category: string;
  volunteersNeeded: number;
  joinedVolunteers: string[]; // array of user IDs
  status: MissionStatus;
  createdAt: Date;
  createdBy: string;
}
