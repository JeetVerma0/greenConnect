export type ReportStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "awaiting_verification"
  | "verified_resolution";

export type ReportCategory =
  | "waste"
  | "pollution"
  | "deforestation"
  | "water"
  | "other";

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: number;
  imageBefore?: string;
  imageAfter?: string; // Kept for backwards compatibility or final resolution image
  latitude: number;
  longitude: number;
  status: ReportStatus;
  verificationCount: number; // For resolution verification
  createdBy: string;
  assignedTeam?: string;
  linkedMission?: string;
  rejectedBy?: string[];
  createdAt: Date;
  progressUpdates?: ProgressUpdate[];
}

export interface ProgressUpdate {
  id: string;
  reportId: string;
  photoURL: string;
  description: string;
  progressNotes?: string;
  createdAt: Date;
  createdBy: string;
}

export interface Verification {
  userId: string;
  reportId: string;
  type: "progress" | "resolution";
  createdAt: Date;
}
