export const APP_NAME = "GreenConnect";

export const REPORT_CATEGORIES = [
  { value: "waste", label: "Waste" },
  { value: "pollution", label: "Pollution" },
  { value: "deforestation", label: "Deforestation" },
  { value: "water", label: "Water" },
  { value: "other", label: "Other" },
] as const;

export const TEAM_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "waste", label: "Waste" },
  { value: "pollution", label: "Pollution" },
  { value: "deforestation", label: "Deforestation" },
  { value: "water", label: "Water" },
] as const;

export const REPORT_STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
] as const;

export const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.209 };

export const ECO_POINTS = {
  REPORT: 10,
  VERIFY: 5,
  RESOLVE: 50,
  CREATE_TEAM: 25,
} as const;
