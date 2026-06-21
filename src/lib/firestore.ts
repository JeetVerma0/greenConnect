import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import type { UserProfile } from "@/types/user";
import type { Report, ReportCategory, ReportStatus } from "@/types/report";
import type { Team, TeamCategory, TeamMessage } from "@/types/team";
import { computeBadges } from "@/utils/badges";
import { DEFAULT_LOCATION, ECO_POINTS } from "@/utils/constants";
import { distanceInKm } from "@/utils/distance";
import { MOCK_REPORTS, MOCK_TEAMS } from "./mock-data";

function toDate(value: Timestamp | Date | undefined): Date {
  if (!value) return new Date();
  return value instanceof Timestamp ? value.toDate() : value;
}

function parseUser(id: string, data: Record<string, unknown>): UserProfile {
  return {
    uid: id,
    name: (data.name as string) ?? "",
    email: (data.email as string) ?? "",
    bio: data.bio as string | undefined,
    latitude: data.latitude as number | undefined,
    longitude: data.longitude as number | undefined,
    photoURL: data.photoURL as string | undefined,
    ecoScore: (data.ecoScore as number) ?? 0,
    badges: (data.badges as string[]) ?? [],
    joinedTeams: (data.joinedTeams as string[]) ?? [],
    reportsCount: (data.reportsCount as number) ?? 0,
    resolvedCount: (data.resolvedCount as number) ?? 0,
    verificationsCount: (data.verificationsCount as number) ?? 0,
    createdAt: toDate(data.createdAt as Timestamp),
  };
}

function parseReport(id: string, data: Record<string, unknown>): Report {
  return {
    id,
    title: (data.title as string) ?? "",
    description: (data.description as string) ?? "",
    category: (data.category as ReportCategory) ?? "other",
    severity: (data.severity as number) ?? 1,
    imageBefore: data.imageBefore as string | undefined,
    imageAfter: data.imageAfter as string | undefined,
    latitude: (data.latitude as number) ?? 0,
    longitude: (data.longitude as number) ?? 0,
    status: (data.status as ReportStatus) ?? "pending",
    verificationCount: (data.verificationCount as number) ?? 0,
    createdBy: (data.createdBy as string) ?? "",
    assignedTeam: data.assignedTeam as string | undefined,
    createdAt: toDate(data.createdAt as Timestamp),
  };
}

function parseTeam(id: string, data: Record<string, unknown>): Team {
  return {
    id,
    name: (data.name as string) ?? "",
    description: (data.description as string) ?? "",
    category: (data.category as TeamCategory) ?? "general",
    radiusKm: (data.radiusKm as number) ?? 5,
    latitude: (data.latitude as number) ?? DEFAULT_LOCATION.lat,
    longitude: (data.longitude as number) ?? DEFAULT_LOCATION.lng,
    members: (data.members as string[]) ?? [],
    createdBy: (data.createdBy as string) ?? "",
    leaderId: (data.leaderId as string) ?? (data.createdBy as string) ?? "",
    issuesResolved: (data.issuesResolved as number) ?? 0,
    createdAt: toDate(data.createdAt as Timestamp),
  };
}

export async function createUserProfile(
  uid: string,
  data: {
    name: string;
    email: string;
    photoURL?: string;
    latitude?: number;
    longitude?: number;
  }
) {
  await setDoc(doc(db, "users", uid), {
    name: data.name,
    email: data.email,
    photoURL: data.photoURL ?? null,
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    ecoScore: 0,
    badges: [],
    joinedTeams: [],
    reportsCount: 0,
    resolvedCount: 0,
    verificationsCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return parseUser(snap.id, snap.data());
}

async function syncUserBadges(uid: string) {
  const user = await getUserProfile(uid);
  if (!user) return;

  const teamsSnap = await getDocs(
    query(collection(db, "teams"), where("createdBy", "==", uid))
  );

  const badges = computeBadges({
    reportsCount: user.reportsCount ?? 0,
    verificationsCount: user.verificationsCount ?? 0,
    resolvedCount: user.resolvedCount ?? 0,
    teamsCreated: teamsSnap.size,
    ecoScore: user.ecoScore,
  });

  await updateDoc(doc(db, "users", uid), { badges });
}

export async function addEcoPoints(uid: string, points: number) {
  await updateDoc(doc(db, "users", uid), {
    ecoScore: increment(points),
  });
  await syncUserBadges(uid);
}

export async function uploadImage(path: string, file: File): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export function findMatchingTeams(
  report: Pick<Report, "category" | "latitude" | "longitude">,
  teams: Team[]
): Team[] {
  return teams
    .map((team) => ({
      team,
      distance: distanceInKm(
        { lat: report.latitude, lng: report.longitude },
        { lat: team.latitude, lng: team.longitude }
      ),
    }))
    .filter(
      ({ team, distance }) =>
        (team.category === report.category || team.category === "general") &&
        distance <= team.radiusKm
    )
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map(({ team }) => team);
}

export async function getTeams(): Promise<Team[]> {
  try {
    const snap = await getDocs(query(collection(db, "teams"), orderBy("createdAt", "desc")));
    const teams = snap.docs.map((d) => parseTeam(d.id, d.data()));
    return teams.length ? teams : MOCK_TEAMS;
  } catch {
    return MOCK_TEAMS;
  }
}

export async function getReports(): Promise<Report[]> {
  try {
    const snap = await getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc")));
    const reports = snap.docs.map((d) => parseReport(d.id, d.data()));
    return reports.length ? reports : MOCK_REPORTS;
  } catch {
    return MOCK_REPORTS;
  }
}

export async function getReportById(id: string): Promise<Report | null> {
  if (id.startsWith("mock-")) {
    return MOCK_REPORTS.find((r) => r.id === id) ?? null;
  }
  const snap = await getDoc(doc(db, "reports", id));
  if (!snap.exists()) return null;
  return parseReport(snap.id, snap.data());
}

export async function createReport(
  data: Omit<Report, "id" | "createdAt" | "verificationCount" | "status">,
  userId: string
): Promise<Report> {
  const teams = await getTeams();
  const matches = findMatchingTeams(data, teams);
  const assignedTeam = matches[0]?.id;

  const docRef = await addDoc(collection(db, "reports"), {
    title: data.title,
    description: data.description,
    category: data.category,
    severity: data.severity,
    imageBefore: data.imageBefore ?? null,
    imageAfter: data.imageAfter ?? null,
    latitude: data.latitude,
    longitude: data.longitude,
    createdBy: data.createdBy,
    status: "pending",
    verificationCount: 0,
    assignedTeam: assignedTeam ?? null,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "users", userId), {
    reportsCount: increment(1),
  });
  await addEcoPoints(userId, ECO_POINTS.REPORT);
  await syncUserBadges(userId);

  return {
    ...data,
    id: docRef.id,
    status: "pending",
    verificationCount: 0,
    assignedTeam,
    createdAt: new Date(),
  };
}

export async function verifyReport(reportId: string, userId: string) {
  const existing = await getDocs(
    query(
      collection(db, "verifications"),
      where("reportId", "==", reportId),
      where("userId", "==", userId)
    )
  );
  if (!existing.empty) throw new Error("You already verified this report");

  await addDoc(collection(db, "verifications"), {
    reportId,
    userId,
    vote: "confirm",
    createdAt: serverTimestamp(),
  });

  const reportRef = doc(db, "reports", reportId);
  const reportSnap = await getDoc(reportRef);
  if (!reportSnap.exists()) throw new Error("Report not found");

  const newCount = ((reportSnap.data().verificationCount as number) ?? 0) + 1;
  const updates: Record<string, unknown> = { verificationCount: newCount };
  if (newCount >= 3 && reportSnap.data().status === "pending") {
    updates.status = "under_review";
  }

  await updateDoc(reportRef, updates);
  await updateDoc(doc(db, "users", userId), {
    verificationsCount: increment(1),
  });
  await addEcoPoints(userId, ECO_POINTS.VERIFY);
  await syncUserBadges(userId);
}

export async function resolveReport(
  reportId: string,
  userId: string,
  imageAfterUrl: string
) {
  await updateDoc(doc(db, "reports", reportId), {
    status: "resolved",
    imageAfter: imageAfterUrl,
  });

  await updateDoc(doc(db, "users", userId), {
    resolvedCount: increment(1),
  });
  await addEcoPoints(userId, ECO_POINTS.RESOLVE);
  await syncUserBadges(userId);
}

export async function createTeam(
  data: Omit<Team, "id" | "createdAt" | "members" | "issuesResolved" | "leaderId">,
  userId: string
): Promise<Team> {
  const docRef = await addDoc(collection(db, "teams"), {
    name: data.name,
    description: data.description,
    category: data.category,
    radiusKm: data.radiusKm,
    latitude: data.latitude,
    longitude: data.longitude,
    createdBy: data.createdBy,
    leaderId: userId,
    members: [userId],
    issuesResolved: 0,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "users", userId), {
    joinedTeams: arrayUnion(docRef.id),
  });
  await addEcoPoints(userId, ECO_POINTS.CREATE_TEAM);
  await syncUserBadges(userId);

  return {
    ...data,
    id: docRef.id,
    leaderId: userId,
    members: [userId],
    issuesResolved: 0,
    createdAt: new Date(),
  };
}

export async function joinTeam(teamId: string, userId: string) {
  await updateDoc(doc(db, "teams", teamId), {
    members: arrayUnion(userId),
  });
  await updateDoc(doc(db, "users", userId), {
    joinedTeams: arrayUnion(teamId),
  });
}

export async function leaveTeam(teamId: string, userId: string) {
  await updateDoc(doc(db, "teams", teamId), {
    members: arrayRemove(userId),
  });
  await updateDoc(doc(db, "users", userId), {
    joinedTeams: arrayRemove(teamId),
  });
}

export async function getUserReports(userId: string): Promise<Report[]> {
  const snap = await getDocs(
    query(collection(db, "reports"), where("createdBy", "==", userId))
  );
  return snap.docs.map((d) => parseReport(d.id, d.data()));
}

export async function getUserResolvedReports(userId: string): Promise<Report[]> {
  const all = await getReports();
  return all.filter((r) => r.status === "resolved" && r.createdBy === userId);
}

export async function getMultipleUserProfiles(uids: string[]): Promise<UserProfile[]> {
  if (!uids || uids.length === 0) return [];
  const profiles = await Promise.all(
    uids.map(async (uid) => {
      try {
        if (uid === "demo") {
          return {
            uid: "demo",
            name: "Demo Volunteer",
            email: "demo@greenconnect.org",
            ecoScore: 120,
            badges: ["first_report"],
            joinedTeams: ["mock-team-1"],
            createdAt: new Date(),
          };
        }
        const profile = await getUserProfile(uid);
        return profile;
      } catch (err) {
        console.error("Failed to fetch profile for user:", uid, err);
        return null;
      }
    })
  );
  return profiles.filter((p): p is UserProfile => p !== null);
}

export async function createTeamMessage(
  teamId: string,
  senderId: string,
  senderName: string,
  content: string,
  type: "chat" | "alert" | "campaign"
): Promise<TeamMessage> {
  const docRef = await addDoc(collection(db, "teams", teamId, "messages"), {
    teamId,
    senderId,
    senderName,
    content,
    type,
    createdAt: serverTimestamp(),
  });
  return {
    id: docRef.id,
    teamId,
    senderId,
    senderName,
    content,
    type,
    createdAt: new Date(),
  };
}

export function subscribeTeamMessages(
  teamId: string,
  callback: (messages: TeamMessage[]) => void,
  errorCallback?: (error: Error) => void
) {
  const q = collection(db, "teams", teamId, "messages");
  return onSnapshot(
    q,
    (snap) => {
      const messages = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            teamId: data.teamId as string,
            senderId: data.senderId as string,
            senderName: data.senderName as string,
            content: data.content as string,
            type: (data.type as "chat" | "alert" | "campaign") ?? "chat",
            createdAt: toDate(data.createdAt as Timestamp),
          };
        })
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      callback(messages);
    },
    (err) => {
      console.error("Subscription failed:", err);
      if (errorCallback) errorCallback(err);
    }
  );
}

export async function updateUserProfile(
  uid: string,
  data: {
    name?: string;
    bio?: string;
    photoURL?: string;
    latitude?: number;
    longitude?: number;
  }
) {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    ...data,
  });
}

export function subscribeReports(
  callback: (reports: Report[]) => void,
  errorCallback?: (error: Error) => void
) {
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const reports = snap.docs.map((d) => parseReport(d.id, d.data()));
      callback(reports.length ? reports : MOCK_REPORTS);
    },
    (err) => {
      console.error("Reports subscription failed:", err);
      // Fallback to mock data so the app continues to display values locally
      callback(MOCK_REPORTS);
      if (errorCallback) errorCallback(err);
    }
  );
}
