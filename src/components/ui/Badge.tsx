const statusStyles: Record<string, string> = {
  open: "bg-warning/10 text-warning border-warning/20 backdrop-blur-sm",
  assigned: "bg-blue-500/10 text-blue-400 border-blue-500/20 backdrop-blur-sm",
  in_progress: "bg-[var(--badge-in-progress-bg)] text-[var(--badge-in-progress-text)] border-[var(--badge-in-progress-border)] dark:bg-primary/10 dark:text-primary dark:border-primary/20 backdrop-blur-sm",
  awaiting_verification: "bg-purple-500/10 text-purple-400 border-purple-500/20 backdrop-blur-sm",
  verified_resolution: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 backdrop-blur-sm",
};

const statusLabels: Record<string, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In Progress",
  awaiting_verification: "Awaiting Verification",
  verified_resolution: "Verified Resolution",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide ${
        statusStyles[status] ?? statusStyles.pending
      }`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card-opacity-bg px-2.5 py-0.5 text-xs font-medium capitalize text-text-secondary backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
      {category}
    </span>
  );
}

