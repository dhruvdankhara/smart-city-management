"use client";

import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { AlertBanner } from "@/components/shared/alert-banner";
import apiClient from "@/lib/api-client";
import Link from "next/link";

export default function CitizenDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashData, setDashData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await apiClient.get("/dashboard?timeframe=month");
        setDashData(data.data);
      } catch {
        setError("Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Track your complaints and their status"
        action={
          <Link
            href="/dashboard/citizen/complaints/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <FileText className="h-4 w-4" />
            New Complaint
          </Link>
        }
      />

      {error && (
        <AlertBanner
          variant="error"
          message={error}
          onClose={() => setError("")}
        />
      )}

      {dashData && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Complaints"
              value={dashData.stats.total}
              icon={FileText}
            />
            <StatCard
              title="Pending"
              value={dashData.stats.reported + dashData.stats.assigned}
              icon={Clock}
              description="Reported + Assigned"
            />
            <StatCard
              title="In Progress"
              value={dashData.stats.inProgress}
              icon={AlertTriangle}
            />
            <StatCard
              title="Resolved"
              value={dashData.stats.resolved}
              icon={CheckCircle}
            />
          </div>

          {/* Recent complaints */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Recent Complaints</h2>
            </div>
            <div className="divide-y">
              {dashData.recentComplaints?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No complaints yet. File your first complaint to get started.
                </div>
              )}
              {dashData.recentComplaints?.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (complaint: any) => (
                  <Link
                    key={complaint._id}
                    href={`/dashboard/citizen/complaints/${complaint._id}`}
                    className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{complaint.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {complaint.categoryId?.name} &middot;{" "}
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={complaint.priority} />
                      <StatusBadge status={complaint.status} />
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
