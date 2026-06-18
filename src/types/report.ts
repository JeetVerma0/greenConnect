export type ReportStatus = "pending" | "under_review" | "in_progress" | "resolved";

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
  imageAfter?: string;
  latitude: number;
  longitude: number;
  status: ReportStatus;
  verificationCount: number;
  createdBy: string;
  assignedTeam?: string;
  createdAt: Date;
}
