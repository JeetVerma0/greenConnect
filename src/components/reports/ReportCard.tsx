import Link from "next/link";
import Image from "next/image";
import { Users, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge, CategoryBadge } from "@/components/ui/Badge";
import type { Report } from "@/types/report";

export function ReportCard({ report }: { report: Report }) {
  // Compute severity percentage for custom bar indicator
  const severityPercentage = (report.severity / 5) * 100;
  
  // Custom color for severity indicator
  const severityColor = report.severity >= 4 ? "bg-danger" : report.severity >= 3 ? "bg-warning" : "bg-primary";

  return (
    <Link href={`/reports/${report.id}`} className="group block h-full">
      <Card className="overflow-hidden h-full flex flex-col justify-between p-0 bg-card-opacity-bg border border-border rounded-xl">
        <div>
          {report.imageBefore ? (
            <div className="relative aspect-video w-full overflow-hidden bg-surface border-b border-border">
              <Image
                src={report.imageBefore}
                alt={report.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-102"
                unoptimized
              />
            </div>
          ) : (
            <div className="relative aspect-video w-full bg-surface border-b border-border flex items-center justify-center text-text-secondary/30">
              <AlertCircle className="h-8 w-8" />
            </div>
          )}
          
          <div className="p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <StatusBadge status={report.status} />
              <CategoryBadge category={report.category} />
            </div>
            
            <h3 className="font-bold text-sm text-text-primary group-hover:text-primary transition-colors leading-tight">
              {report.title}
            </h3>
            
            <p className="line-clamp-2 text-xs text-text-secondary leading-relaxed">
              {report.description}
            </p>
          </div>
        </div>

        <div className="p-5 pt-0 space-y-3">
          {/* Custom Severity Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-text-secondary/50">
              <span>Severity {report.severity}/5</span>
              <span>Audit Priority</span>
            </div>
            <div className="h-1 w-full bg-card-opacity-bg rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${severityColor}`} style={{ width: `${severityPercentage}%` }} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border text-[10px] text-text-secondary">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-primary/70" />
              {report.verificationCount} verifications
            </span>
            <span className="font-semibold text-primary group-hover:translate-x-0.5 transition-transform duration-200">
              View &rarr;
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}


export function BeforeAfterComparison({
  before,
  after,
  title,
}: {
  before?: string;
  after?: string;
  title: string;
}) {
  if (!before && !after) return null;

  return (
    <Card padding="lg" className="border-border bg-card-opacity-bg rounded-xl">
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-secondary/60">Impact Proof — {title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50">Before Cleanup</p>
          {before ? (
            <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-surface">
              <Image src={before} alt="Before" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-surface border border-border text-xs text-text-secondary/60">
              No image evidence
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50">After Cleanup</p>
          {after ? (
            <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-surface">
              <Image src={after} alt="After" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-surface border border-dashed border-white/10 text-xs text-text-secondary/40">
              Awaiting restoration proof
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

