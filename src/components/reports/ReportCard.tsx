import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { StatusBadge, CategoryBadge } from "@/components/ui/Badge";
import type { Report } from "@/types/report";

export function ReportCard({ report }: { report: Report }) {
  return (
    <Link href={`/reports/${report.id}`}>
      <Card className="overflow-hidden transition-colors hover:border-primary/40">
        {report.imageBefore && (
          <div className="relative -mx-5 -mt-5 mb-4 h-40 overflow-hidden">
            <Image
              src={report.imageBefore}
              alt={report.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <CategoryBadge category={report.category} />
          </div>
          <h3 className="font-medium">{report.title}</h3>
          <p className="line-clamp-2 text-sm text-text-secondary">
            {report.description}
          </p>
          <div className="flex items-center justify-between pt-1 text-xs text-text-secondary">
            <span>Severity {report.severity}/5</span>
            <span>{report.verificationCount} verifications</span>
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
    <Card padding="lg">
      <h3 className="mb-4 font-medium">Impact Proof — {title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-text-secondary">Before</p>
          {before ? (
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image src={before} alt="Before" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-surface text-sm text-text-secondary">
              No image
            </div>
          )}
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-text-secondary">After</p>
          {after ? (
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image src={after} alt="After" fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-surface text-sm text-text-secondary">
              Awaiting resolution
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
