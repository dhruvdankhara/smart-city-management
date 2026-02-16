"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import apiClient from "@/lib/api-client";
import Link from "next/link";
import type { ComplaintStatus } from "@/types";

export default function WorkerDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashData, setDashData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/dashboard?timeframe=month")
      .then(({ data }) => {
        setDashData(data.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
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
        title="Worker Dashboard"
        description="Overview of your assigned tasks"
      />

      {dashData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Assigned"
              value={dashData.stats.total}
              icon={ClipboardList}
            />
            <StatCard
              title="Pending"
              value={dashData.stats.assigned}
              icon={Clock}
            />
            <StatCard
              title="In Progress"
              value={dashData.stats.inProgress}
              icon={AlertTriangle}
            />
            <StatCard
              title="Completed"
              value={dashData.stats.resolved}
              icon={CheckCircle}
            />
          </div>

          {/* Recent tasks */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Recent Tasks</h2>
            </div>
            <div className="divide-y">
              {dashData.recentComplaints?.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No tasks assigned yet.
                </div>
              )}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {dashData.recentComplaints?.map((task: any) => (
                <Link
                  key={task._id}
                  href={`/dashboard/worker/tasks/${task._id}`}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.categoryId?.name} &middot;{" "}
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status as ComplaintStatus} />
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
