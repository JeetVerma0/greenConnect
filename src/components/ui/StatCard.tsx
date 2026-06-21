import { ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  highlighted?: boolean;
}

export function StatCard({ label, value, icon, highlighted = false }: StatCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-xl border p-5 metric-card-hover transition-all ${
      highlighted
        ? "bg-[var(--sidebar-item-active)] border-[var(--active-filter-border)] dark:bg-card-opacity-bg dark:border-border"
        : "bg-card-opacity-bg border-border"
    }`}>
      {/* Ambient glass glow */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/1 blur-xl" />
      
      <div className="flex items-start justify-between relative z-10">
        <p className={`text-xs font-semibold uppercase tracking-wider ${
          highlighted ? "text-text-primary/75 dark:text-text-secondary/70" : "text-text-secondary/70"
        }`}>{label}</p>
        <div className={`rounded-lg p-1.5 text-primary transition-all duration-300 group-hover:bg-primary/8 ${
          highlighted ? "bg-white/45 dark:bg-card-opacity-bg" : "bg-card-opacity-bg"
        }`}>
          {icon ?? <ArrowUpRight className="h-4 w-4 opacity-60" />}
        </div>
      </div>
      
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-text-primary">
        {value}
      </p>
    </div>
  );
}

