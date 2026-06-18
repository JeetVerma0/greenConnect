import { ECO_POINTS } from "./constants";

export function calculateReportPoints(severity: number): number {
  return ECO_POINTS.REPORT + severity * 5;
}

export function calculateTotalScore(
  reportsSubmitted: number,
  reportsResolved: number,
  teamsCreated: number
): number {
  return (
    reportsSubmitted * ECO_POINTS.REPORT +
    reportsResolved * ECO_POINTS.RESOLVE +
    teamsCreated * ECO_POINTS.CREATE_TEAM
  );
}
