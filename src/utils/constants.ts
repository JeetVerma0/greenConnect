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
  { value: "open", label: "Open" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_verification", label: "Awaiting Verification" },
  { value: "verified_resolution", label: "Verified Resolution" },
] as const;

export const DEFAULT_LOCATION = { lat: 28.6139, lng: 77.209 };

export const ECO_POINTS = {
  REPORT: 20,
  VERIFY_PROGRESS: 5,
  VERIFY_RESOLUTION: 10,
  PARTICIPATE_MISSION: 30, // Joining a team or cleanup
  RESOLVE: 50,
  CREATE_TEAM: 25,
} as const;
