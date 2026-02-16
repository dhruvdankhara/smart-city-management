"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ComplaintHeatmap } from "@/components/shared/complaint-heatmap";
import { AlertBanner } from "@/components/shared/alert-banner";
import apiClient from "@/lib/api-client";

const priorityWeight: Record<string, number> = {
  low: 0.3,
  medium: 0.5,
  high: 0.8,
  critical: 1.0,
};

export default function SuperAdminHeatmap() {
  const [points, setPoints] = useState<
    { lat: number; lng: number; intensity: number }[]
  >([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient.get("/departments").then(({ data }) => setDepartments(data.data));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = selectedDept ? `?departmentId=${selectedDept}` : "";
    apiClient
      .get(`/complaints/map${params}`)
      .then(({ data }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const heatPoints = data.data
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((c: any) => c.location?.coordinates)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((c: any) => ({
            lat: c.location.coordinates[1],
            lng: c.location.coordinates[0],
            intensity: priorityWeight[c.priority] || 0.5,
          }));
        setPoints(heatPoints);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load heatmap data");
        setIsLoading(false);
      });
  }, [selectedDept]);

  return (
    <div>
      <PageHeader
        title="Complaints Heatmap"
        description="Density visualization of complaints across the city"
        backHref="/dashboard/super-admin"
        action={
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="">All Departments</option>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {departments.map((d: any) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        }
      />

      {error && <AlertBanner variant="error" message={error} />}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <ComplaintHeatmap points={points} />
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-20 rounded bg-gradient-to-r from-[#313695] via-[#fee090] to-[#a50026]" />
              <span className="text-muted-foreground">Low to High density</span>
            </div>
            <span className="text-muted-foreground">
              {points.length} complaints on map
            </span>
          </div>
        </>
      )}
    </div>
  );
}
