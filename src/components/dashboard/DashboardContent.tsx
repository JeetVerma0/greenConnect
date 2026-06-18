"use client";

import Link from "next/link";
import {
  FilePlus,
  Users,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/context/AuthContext";
import type { Report } from "@/types/report";

const quickActions = [
  { href: "/reports/create", label: "Report Issue", icon: FilePlus, color: "text-primary" },
  { href: "/teams", label: "Join Mission", icon: Users, color: "text-blue-400" },
  { href: "/teams", label: "Create Team", icon: PlusCircle, color: "text-warning" },
  { href: "/reports", label: "Resolve Issue", icon: CheckCircle, color: "text-primary" },
];

interface DashboardContentProps {
  reports: Report[];
}

export function DashboardContent({ reports }: DashboardContentProps) {
  const { profile } = useAuth();

  const activeReports = reports.filter((r) => r.status !== "resolved").length;
  const resolvedReports = reports.filter((r) => r.status === "resolved").length;
  const nearbyAlerts = reports.filter((r) => r.status === "pending").slice(0, 3);

  return (
    <div className="space-y-8 p-4 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold">
          Hello, {profile?.name?.split(" ")[0] ?? "Volunteer"}
        </h1>
        <p className="mt-1 text-text-secondary">
          Here&apos;s your environmental impact overview
        </p>
      </div>

      <Card padding="lg" className="bg-gradient-to-br from-card to-surface">
        <p className="text-sm text-text-secondary">Eco Impact</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Eco Score" value={profile?.ecoScore ?? 0} />
          <StatCard label="Active Reports" value={activeReports} />
          <StatCard label="Volunteer Hours" value={Math.floor((profile?.ecoScore ?? 0) / 5)} />
          <StatCard label="Teams Joined" value={profile?.joinedTeams?.length ?? 0} />
        </div>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-medium">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ href, label, icon: Icon, color }) => (
            <Link key={label} href={href}>
              <Card className="flex items-center gap-3 transition-colors hover:border-primary/40">
                <div className={`rounded-lg bg-surface p-2.5 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Nearby Alerts</h2>
          <Link href="/map" className="text-sm text-primary hover:underline">
            View on map
          </Link>
        </div>
        {nearbyAlerts.length === 0 ? (
          <Card>
            <p className="text-sm text-text-secondary">No pending alerts nearby.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {nearbyAlerts.map((report) => (
              <Link key={report.id} href={`/reports/${report.id}`}>
                <Card className="flex items-start gap-3 transition-colors hover:border-primary/40">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                  <div>
                    <p className="font-medium">{report.title}</p>
                    <p className="text-sm text-text-secondary capitalize">
                      {report.category} · Severity {report.severity}/5
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">Recent Activity</h2>
        <Card>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Issues reported by you</span>
              <span>{profile?.reportsCount ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Issues resolved</span>
              <span>{resolvedReports}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Verifications made</span>
              <span>{profile?.verificationsCount ?? 0}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
