"use client";

import { useEffect, useState } from "react";
import { TeamsContent } from "@/components/teams/TeamsContent";
import { getTeams } from "@/lib/firestore";
import type { Team } from "@/types/team";

export function TeamsPageClient() {
  const [teams, setTeams] = useState<Team[]>([]);

  const loadTeams = () => {
    getTeams().then(setTeams);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  return <TeamsContent teams={teams} onRefresh={loadTeams} />;
}
