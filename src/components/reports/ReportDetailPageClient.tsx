"use client";

import { useEffect, useState } from "react";
import { ReportDetail } from "@/components/reports/ReportDetail";
import { getReportById, getTeams } from "@/lib/firestore";

export function ReportDetailPageClient({ id }: { id: string }) {
  const [teamName, setTeamName] = useState<string>();
  const [report, setReport] = useState<Awaited<ReturnType<typeof getReportById>>>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function load() {
      const [reportData, teams] = await Promise.all([getReportById(id), getTeams()]);
      setReport(reportData);
      if (reportData?.assignedTeam) {
        const team = teams.find((t) => t.id === reportData.assignedTeam);
        setTeamName(team?.name);
      }
      setLoading(false);
    }
    load();
  }, [id, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8">
        <p className="text-text-secondary">Report not found.</p>
      </div>
    );
  }

  return <ReportDetail report={report} teamName={teamName} onUpdate={async () => setRefreshTrigger(t => t + 1)} />;
}
