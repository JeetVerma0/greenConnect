"use client";

import { useEffect, useState } from "react";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { getReports } from "@/lib/firestore";
import type { Report } from "@/types/report";

export function DashboardPageClient() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    getReports().then(setReports);
  }, []);

  return <DashboardContent reports={reports} />;
}
