"use client";

import Link from "next/link";
import {
  FilePlus,
  Users,
  PlusCircle,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/context/AuthContext";
import type { Report } from "@/types/report";

const quickActions = [
  { href: "/reports/create", label: "Report Issue", desc: "Pin a new issue", icon: FilePlus, color: "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20 hover:bg-[#10b981]/15" },
  { href: "/teams", label: "Join Mission", desc: "Find cleanup events", icon: Users, color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15" },
  { href: "/teams", label: "Create Team", desc: "Form a volunteer unit", icon: PlusCircle, color: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15" },
  { href: "/reports", label: "Resolve Issue", desc: "Verify community cleanup", icon: CheckCircle, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15" },
];

interface DashboardContentProps {
  reports: Report[];
}

export function DashboardContent({ reports }: DashboardContentProps) {
  const { profile } = useAuth();

  const activeReports = reports.filter((r) => r.status !== "verified_resolution").length;
  const resolvedReports = reports.filter((r) => r.status === "verified_resolution").length;
  const nearbyAlerts = reports.filter((r) => r.status === "open").slice(0, 3);

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-6xl mx-auto pb-16">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Hello, {profile?.name?.split(" ")[0] ?? "Volunteer"}
          </h1>
          <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">
            Here&apos;s your environmental impact overview and community tasks.
          </p>
        </div>
        
        {/* Inline short stats badge */}
        <div className="flex items-center gap-2 rounded-xl bg-card-opacity-bg border border-border px-4 py-2.5 backdrop-blur-md self-start md:self-auto">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-text-secondary">Level 4 Eco Hero</span>
        </div>
      </div>

      {/* Stats Board */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card-opacity-bg to-transparent p-6 shadow-md">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/1 blur-[80px]" />
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary/60">Eco Impact Scorecard</h2>
          <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Eco Score" value={profile?.ecoScore ?? 0} highlighted />
          <StatCard label="Active Reports" value={activeReports} />
          <StatCard label="Volunteer Hours" value={Math.floor((profile?.ecoScore ?? 0) / 5)} />
          <StatCard label="Teams Joined" value={profile?.joinedTeams?.length ?? 0} />
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-secondary/60">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ href, label, desc, icon: Icon, color }) => (
            <Link key={label} href={href} className="group">
              <Card className="flex flex-col items-start gap-4 p-5 h-full">
                <div className={`rounded-xl p-3 border transition-all duration-300 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-text-primary group-hover:text-primary transition-colors duration-200">
                    {label}
                  </span>
                  <span className="block mt-1 text-xs text-text-secondary/80 leading-normal">
                    {desc}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Layout split */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Nearby Alerts Column */}
        <div className="flex flex-col h-full">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary/60">Nearby Alerts</h2>
            <Link href="/map" className="group flex items-center gap-1 text-xs font-semibold text-primary hover:underline transition-all duration-200">
              View on map
              <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col justify-between">
            {nearbyAlerts.length === 0 ? (
              <Card className="flex items-center justify-center py-10" hoverable={false}>
                <p className="text-sm text-text-secondary">No pending alerts nearby.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {nearbyAlerts.map((report) => (
                  <Link key={report.id} href={`/reports/${report.id}`} className="block group">
                    <Card className="flex items-start gap-4 p-4">
                      <div className="rounded-lg bg-warning/10 p-2 text-warning border border-warning/20 shrink-0 transition-all">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-text-primary transition-colors duration-200">
                          {report.title}
                        </p>
                        <p className="text-xs text-text-secondary capitalize">
                          {report.category} · Severity {report.severity}/5
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity summary Column */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-secondary/60">Activity Summary</h2>
          <Card hoverable={false} className="p-6 h-full flex flex-col justify-center">
            <div className="space-y-5">
              {[
                { label: "Issues reported by you", value: profile?.reportsCount ?? 0, pct: "w-2/3 bg-primary" },
                { label: "Issues resolved", value: resolvedReports, pct: "w-1/2 bg-blue-400" },
                { label: "Verifications made", value: profile?.verificationsCount ?? 0, pct: "w-1/3 bg-amber-400" },
              ].map(({ label, value, pct }) => (
                <div key={label} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-text-secondary">{label}</span>
                    <span className="text-text-primary font-bold">{value}</span>
                  </div>
                  {/* Glass progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-[var(--progress-track-bg)] overflow-hidden">
                    <div className={`h-full rounded-full ${pct}`} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

