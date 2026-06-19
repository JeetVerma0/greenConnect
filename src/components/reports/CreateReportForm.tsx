"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { createReport, uploadImage } from "@/lib/firestore";
import { REPORT_CATEGORIES } from "@/utils/constants";
import { getCurrentLocation } from "@/utils/geolocation";
import { useAuth } from "@/context/AuthContext";
import type { ReportCategory } from "@/types/report";

interface ReportFormData {
  title: string;
  description: string;
  category: ReportCategory;
  severity: string;
  latitude: string;
  longitude: string;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export function CreateReportForm() {
  const { firebaseUser, refreshProfile } = useAuth();
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue } = useForm<ReportFormData>({
    defaultValues: {
      category: "waste",
      severity: "3",
      latitude: "28.6139",
      longitude: "77.2090",
    },
  });

  const detectLocation = async () => {
    setLocationMessage("");
    try {
      const coords = await getCurrentLocation();
      setValue("latitude", coords.latitude.toFixed(6));
      setValue("longitude", coords.longitude.toFixed(6));
      setLocationMessage("Location detected successfully.");
    } catch (err) {
      setLocationMessage(err instanceof Error ? err.message : "Failed to get location");
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    if (!firebaseUser) return;
    setLoading(true);
    setError("");
    try {
      let imageBefore: string | undefined;
      if (imageFile) {
        // Compress image to base64 to bypass Firebase Storage CORS/Bucket issues
        imageBefore = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(imageFile);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const MAX_WIDTH = 800;
              const scaleSize = MAX_WIDTH / img.width;
              canvas.width = MAX_WIDTH;
              canvas.height = img.height * scaleSize;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
              resolve(canvas.toDataURL("image/jpeg", 0.7));
            };
            img.onerror = (e) => reject(e);
          };
          reader.onerror = (e) => reject(e);
        });
      }

      const report = await createReport(
        {
          title: data.title,
          description: data.description,
          category: data.category,
          severity: Number(data.severity),
          imageBefore,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          createdBy: firebaseUser.uid,
        },
        firebaseUser.uid
      );

      await refreshProfile();
      router.push(`/reports/${report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="lg" className="max-w-2xl">
      <h1 className="text-xl font-semibold">Report an Issue</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Document environmental problems in your community
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input label="Title" {...register("title", { required: true })} placeholder="Brief issue title" />
        <div>
          <label className="text-sm text-text-secondary">Description</label>
          <textarea
            {...register("description", { required: true })}
            rows={4}
            className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary"
            placeholder="Describe the issue in detail"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            options={REPORT_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
            {...register("category")}
          />
          <Select
            label="Severity (1-5)"
            options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
            {...register("severity")}
          />
        </div>
        <div>
          <label className="text-sm text-text-secondary">Before Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="mt-1.5 block w-full text-sm text-text-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-background"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Latitude" {...register("latitude")} />
          <Input label="Longitude" {...register("longitude")} />
        </div>
        <Button type="button" variant="secondary" onClick={detectLocation}>
          Use My Location
        </Button>
        {locationMessage && (
          <p className="text-xs text-text-secondary">{locationMessage}</p>
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Report"}
        </Button>
      </form>
    </Card>
  );
}
