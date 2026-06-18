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

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  delhi: { lat: 28.6139, lng: 77.209 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  pune: { lat: 18.5204, lng: 73.8567 },
};

export const DEFAULT_CITY = "delhi";

export const ECO_POINTS = {
  REPORT: 10,
  VERIFY: 5,
  RESOLVE: 50,
  CREATE_TEAM: 25,
} as const;
