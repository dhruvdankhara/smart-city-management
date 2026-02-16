"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Users,
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import apiClient from "@/lib/api-client";
import Link from "next/link";
import type { ComplaintStatus } from "@/types";

export default function SuperAdminDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashData, setDashData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month");

  useEffect(() => {
    apiClient
      .get(`/dashboard?timeframe=${timeframe}`)
      .then(({ data }) => {
        setDashData(data.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
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
        title="Super Admin Dashboard"
        description="System-wide overview and analytics"
        action={
          <div className="flex gap-2">
            {["day", "week", "month", "year"].map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setIsLoading(true);
                  setTimeframe(tf);
                }}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                  timeframe === tf
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
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
          {/* Main stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Complaints"
              value={dashData.stats.total}
              icon={FileText}
            />
            <StatCard
              title="Total Users"
              value={dashData.totalUsers}
              icon={Users}
            />
            <StatCard
              title="Resolved"
              value={dashData.stats.resolved}
              icon={CheckCircle}
            />
            <StatCard
              title="Critical"
              value={dashData.priorityBreakdown?.critical || 0}
              icon={AlertTriangle}
            />
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              {
                key: "reported",
                label: "Reported",
                icon: AlertCircle,
                color: "text-blue-600",
              },
              {
                key: "assigned",
                label: "Assigned",
                icon: Users,
                color: "text-yellow-600",
              },
              {
                key: "inProgress",
                label: "In Progress",
                icon: Clock,
                color: "text-purple-600",
              },
              {
                key: "resolved",
                label: "Resolved",
                icon: CheckCircle,
                color: "text-green-600",
              },
              {
                key: "rejected",
                label: "Rejected",
                icon: AlertTriangle,
                color: "text-red-600",
              },
              {
                key: "cancelled",
                label: "Cancelled",
                icon: FileText,
                color: "text-gray-500",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="rounded-lg border bg-card p-3 text-center"
              >
                <item.icon className={`h-5 w-5 mx-auto ${item.color}`} />
                <p className="text-xl font-bold mt-1">
                  {dashData.stats[item.key] || 0}
                </p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Department stats */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">
                Department Performance
              </h3>
              <div className="space-y-4">
                {dashData.departmentStats?.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (dept: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{dept.department}</span>
                        <span className="text-muted-foreground">
                          {dept.resolved}/{dept.total} ({dept.resolutionRate}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${dept.resolutionRate}%` }}
                        />
                      </div>
                    </div>
                  ),
                )}
                {(!dashData.departmentStats ||
                  dashData.departmentStats.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No department data
                  </p>
                )}
              </div>
            </div>

            {/* Complaints over time */}
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">
                Complaints Over Time
              </h3>
              <div className="space-y-2">
                {dashData.complaintsOverTime?.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (day: any) => {
                    const maxCount = Math.max(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ...dashData.complaintsOverTime.map((d: any) => d.count),
                      1,
                    );
                    return (
                      <div
                        key={day._id}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="w-24 text-muted-foreground text-xs">
                          {day._id}
                        </span>
                        <div className="flex-1 h-4 rounded bg-muted overflow-hidden">
                          <div
                            className="h-full rounded bg-primary"
                            style={{
                              width: `${(day.count / maxCount) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs">
                          {day.count}
                        </span>
                      </div>
                    );
                  },
                )}
                {(!dashData.complaintsOverTime ||
                  dashData.complaintsOverTime.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    No data for this period
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Recent complaints */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Complaints</h2>
              <Link
                href="/dashboard/super-admin/complaints"
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
                  href={`/dashboard/super-admin/complaints/${complaint._id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{complaint.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {complaint.departmentId?.name} &middot;{" "}
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
