"use client";

import { useEffect, useState } from "react";
import { MapView } from "@/components/map/MapView";
import { getReports, getTeams } from "@/lib/firestore";
import type { Report } from "@/types/report";
import type { Team } from "@/types/team";

export function MapPageClient() {
  const [reports, setReports] = useState<Report[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    Promise.all([getReports(), getTeams()]).then(([r, t]) => {
      setReports(r);
      setTeams(t);
    });
  }, []);

  return <MapView reports={reports} teams={teams} />;
}
