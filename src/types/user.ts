export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  latitude?: number;
  longitude?: number;
  photoURL?: string;
  ecoScore: number;
  badges: string[];
  joinedTeams: string[];
  reportsCount?: number;
  resolvedCount?: number;
  verificationsCount?: number;
  createdAt: Date;
}
