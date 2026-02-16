"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { AlertBanner } from "@/components/shared/alert-banner";
import apiClient from "@/lib/api-client";
import Link from "next/link";
import type { ComplaintStatus } from "@/types";

export default function AdminDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashData, setDashData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month");

  const fetchDashboard = async (tf: string) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get(`/dashboard?timeframe=${tf}`);
      setDashData(data.data);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(timeframe);
  }, [timeframe]);

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
        title="Department Dashboard"
        description="Overview of complaints and operations"
        action={
          <div className="flex gap-2">
            {["day", "week", "month", "year"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  timeframe === tf
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        }
      />

      {dashData && (
        <>
          {/* Overdue alert */}
          {dashData.overdueComplaints > 0 && (
            <div className="mb-4">
              <AlertBanner
                variant="warning"
                message={`${dashData.overdueComplaints} complaint(s) have passed their SLA deadline!`}
              />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <StatCard
              title="Total"
              value={dashData.stats.total}
              icon={FileText}
            />
            <StatCard
              title="Reported"
              value={dashData.stats.reported}
              icon={AlertCircle}
            />
            <StatCard
              title="Assigned"
              value={dashData.stats.assigned}
              icon={Users}
            />
            <StatCard
              title="In Progress"
              value={dashData.stats.inProgress}
              icon={Clock}
            />
            <StatCard
              title="Resolved"
              value={dashData.stats.resolved}
              icon={CheckCircle}
            />
            <StatCard
              title="Overdue"
              value={dashData.overdueComplaints || 0}
              icon={AlertTriangle}
            />
          </div>

          {/* Priority breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Priority Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(dashData.priorityBreakdown).map(
                  ([priority, count]) => {
                    const total = dashData.stats.total || 1;
                    const percentage = Math.round(
                      (Number(count) / total) * 100,
                    );
                    const colors: Record<string, string> = {
                      low: "bg-slate-400",
                      medium: "bg-blue-400",
                      high: "bg-orange-400",
                      critical: "bg-red-500",
                    };
                    return (
                      <div key={priority} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{priority}</span>
                          <span className="text-muted-foreground">
                            {String(count)} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors[priority] || "bg-primary"}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Worker Stats */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Worker Performance</h3>
              {dashData.workerStats?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No worker data available
                </p>
              )}
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {dashData.workerStats?.map((ws: any) => {
                  return (
                    <div
                      key={ws._id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                          {ws.avatar?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={ws.avatar.url}
                              alt={ws.name || "Worker"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-primary">
                              {(ws.name || "?").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">{ws.name || "Unknown"}</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="text-blue-600">
                          {ws.active} active
                        </span>
                        <span className="text-green-600">
                          {ws.resolved} done
                        </span>
                        <span className="text-muted-foreground">
                          {ws.total} total
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Area Breakdown */}
          {(dashData.areaStats?.length > 0 ||
            dashData.unassignedAreaCount > 0) && (
            <div className="rounded-xl border bg-card p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Area Breakdown</h3>
              </div>
              <div className="space-y-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {dashData.areaStats?.map((area: any) => (
                  <div
                    key={area._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">{area.name}</span>
                    <div className="flex gap-3">
                      <span className="text-muted-foreground">
                        {area.total} complaints
                      </span>
                      <span className="text-green-600">
                        {area.resolved} resolved
                      </span>
                    </div>
                  </div>
                ))}
                {dashData.unassignedAreaCount > 0 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground pt-1 border-t">
                    <span>Unassigned Area</span>
                    <span>{dashData.unassignedAreaCount} complaints</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent complaints */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Complaints</h2>
              <Link
                href="/dashboard/admin/complaints"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="divide-y">
              {dashData.recentComplaints?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No complaints yet.
                </div>
              )}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {dashData.recentComplaints?.map((complaint: any) => (
                <Link
                  key={complaint._id}
                  href={`/dashboard/admin/complaints/${complaint._id}`}
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
                    <StatusBadge status={complaint.status as ComplaintStatus} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
