const statusStyles: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  under_review: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  in_progress: "bg-primary/10 text-primary border-primary/20",
  resolved: "bg-primary/10 text-primary border-primary/20",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  under_review: "Under Review",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${statusStyles[status] ?? statusStyles.pending}`}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium capitalize text-text-secondary">
      {category}
    </span>
  );
}
