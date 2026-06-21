"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, AlertCircle, FileText, CheckCircle2, Inbox } from "lucide-react";
import { ReportCard } from "@/components/reports/ReportCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getReports } from "@/lib/firestore";
import { REPORT_STATUS_FILTERS } from "@/utils/constants";
import type { Report, ReportStatus } from "@/types/report";

export function ReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Search and Sort states (Client-side Only)
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "severity">("date");

  useEffect(() => {
    getReports().then(setReports).finally(() => setLoading(false));
  }, []);

  // Calculate statistics
  const total = reports.length;
  const pending = reports.filter((r) => r.status === "pending").length;
  const inProgress = reports.filter((r) => r.status === "in_progress" || r.status === "under_review").length;
  const resolved = reports.filter((r) => r.status === "resolved").length;

  // Filter & Sort Logic
  const filtered = reports
    .filter((r) => {
      const matchesStatus = filter === "all" || r.status === (filter as ReportStatus);
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "severity") {
        return b.severity - a.severity;
      }
      // Date sort (createdAt fallback)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-6xl mx-auto pb-16">
      
      {/* Title & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Environmental Reports</h1>
          <p className="text-sm text-text-secondary">Community-logged hazards and cleanup audit history</p>
        </div>
        <Link href="/reports/create">
          <Button size="md" className="font-semibold shadow-sm">Report Issue</Button>
        </Link>
      </div>

      {/* Stats Summary Header */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Reports", value: total, icon: FileText, color: "text-[#8892b0]" },
          { label: "Pending Review", value: pending, icon: AlertCircle, color: "text-warning" },
          { label: "In Progress", value: inProgress, icon: SlidersHorizontal, color: "text-blue-400" },
          { label: "Resolved Proofs", value: resolved, icon: CheckCircle2, color: "text-primary" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} padding="sm" className="bg-card-opacity-bg border border-border transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/60">{label}</span>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-text-primary tracking-tight">{value}</p>
          </Card>
        ))}
      </div>

      {/* Filter and Control Bar */}
       <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-t border-border pt-6">
        
        {/* Status Tab list */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {REPORT_STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
                 filter === value
                   ? "bg-[var(--active-filter-bg)] text-[var(--active-filter-text)] border-[var(--active-filter-border)] dark:bg-card-opacity-bg dark:text-text-primary dark:border-border-strong shadow-sm"
                  : "text-text-secondary hover:text-text-primary border-transparent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search & Sort Inputs */}
        <div className="flex flex-wrap items-center gap-3">
           <div className="relative flex items-center bg-white dark:bg-card border border-[#10b981]/12 dark:border-border rounded-lg px-3 py-2 w-full sm:w-64 focus-within:border-primary/40 focus-within:shadow-[0_0_0_1px_rgba(16,185,129,0.12),0_0_16px_rgba(16,185,129,0.06)] transition-all duration-200">
            <Search className="h-3.5 w-3.5 text-text-secondary/50 shrink-0" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-2 w-full bg-transparent text-xs text-text-primary placeholder:text-[#6B7280] dark:placeholder:text-text-secondary/50 outline-none"
            />
          </div>

           <div className="flex items-center gap-2 bg-white dark:bg-card border border-border rounded-lg px-2 py-1.5 text-xs text-text-secondary">
            <SlidersHorizontal className="h-3.5 w-3.5 text-text-secondary/50" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "severity")}
              className="bg-transparent text-text-primary text-xs outline-none cursor-pointer pr-1"
            >
               <option value="date" className="bg-surface text-text-primary">Newest First</option>
               <option value="severity" className="bg-surface text-text-primary">Highest Severity</option>
            </select>
          </div>
        </div>

      </div>

      {/* Grid of cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      ) : filtered.length === 0 ? (
         <div className="rounded-xl border border-border bg-card-opacity-bg p-12 text-center flex flex-col items-center justify-center space-y-3">
          <Inbox className="h-10 w-10 text-text-secondary/35" />
          <div>
            <h4 className="font-semibold text-text-primary text-sm">No reports found</h4>
            <p className="text-xs text-text-secondary mt-1">There are no reports matching your filters or search keywords.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
      
    </div>
  );
}

