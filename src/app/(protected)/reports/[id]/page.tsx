import { ReportDetailPageClient } from "@/components/reports/ReportDetailPageClient";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReportDetailPageClient id={id} />;
}
