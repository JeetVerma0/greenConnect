"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BeforeAfterComparison } from "@/components/reports/ReportCard";
import { StatusBadge, CategoryBadge } from "@/components/ui/Badge";
import { verifyReport, resolveReport, uploadImage } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import type { Report } from "@/types/report";

interface ReportDetailProps {
  report: Report;
  teamName?: string;
}

export function ReportDetail({ report, teamName }: ReportDetailProps) {
  const { firebaseUser, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [afterFile, setAfterFile] = useState<File | null>(null);

  const handleVerify = async () => {
    if (!firebaseUser || report.id.startsWith("mock-")) {
      setError("Verification requires a live report from Firestore");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await verifyReport(report.id, firebaseUser.uid);
      await refreshProfile();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!firebaseUser || !afterFile) return;
    if (report.id.startsWith("mock-")) {
      setError("Resolution upload requires a live report from Firestore");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const url = await uploadImage(
        `reports/${firebaseUser.uid}/after-${Date.now()}-${afterFile.name}`,
        afterFile
      );
      await resolveReport(report.id, firebaseUser.uid, url);
      await refreshProfile();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resolution failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          <CategoryBadge category={report.category} />
        </div>
        <h1 className="mt-3 text-2xl font-semibold">{report.title}</h1>
        <p className="mt-2 text-text-secondary">{report.description}</p>
      </div>

      <BeforeAfterComparison
        before={report.imageBefore}
        after={report.imageAfter}
        title={report.title}
      />

      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-text-secondary">Location</p>
            <p className="font-medium">
              {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Assigned Team</p>
            <p className="font-medium">{teamName ?? report.assignedTeam ?? "Unassigned"}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Verifications</p>
            <p className="font-medium">{report.verificationCount}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Severity</p>
            <p className="font-medium">{report.severity}/5</p>
          </div>
        </div>
      </Card>

      {report.status !== "resolved" && (
        <Card className="space-y-4">
          <h2 className="font-medium">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleVerify} disabled={loading} variant="secondary">
              Verify Report
            </Button>
          </div>
          <div className="border-t border-border pt-4">
            <p className="mb-2 text-sm text-text-secondary">Upload after image to resolve</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAfterFile(e.target.files?.[0] ?? null)}
              className="mb-3 block w-full text-sm text-text-secondary"
            />
            <Button onClick={handleResolve} disabled={loading || !afterFile}>
              Resolve Issue
            </Button>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
        </Card>
      )}
    </div>
  );
}
