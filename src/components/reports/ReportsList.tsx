"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReportCard } from "@/components/reports/ReportCard";
import { Button } from "@/components/ui/Button";
import { getReports } from "@/lib/firestore";
import { REPORT_STATUS_FILTERS } from "@/utils/constants";
import type { Report, ReportStatus } from "@/types/report";

export function ReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReports().then(setReports).finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all"
      ? reports
      : reports.filter((r) => r.status === (filter as ReportStatus));

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-text-secondary">Community environmental issues</p>
        </div>
        <Link href="/reports/create">
          <Button>Report Issue</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {REPORT_STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              filter === value
                ? "bg-primary/10 text-primary"
                : "text-text-secondary hover:bg-card"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-text-secondary">Loading reports...</p>
      ) : filtered.length === 0 ? (
        <p className="text-text-secondary">No reports found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
