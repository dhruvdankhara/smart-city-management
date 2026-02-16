"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import apiClient from "@/lib/api-client";
import type { ComplaintStatus } from "@/types";

export default function WorkerTasks() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tasks, setTasks] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTasks = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await apiClient.get(`/complaints?${params}`);
      setTasks(data.data.complaints);
      setPagination(data.data.pagination);
    } catch {
      // handle error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Assigned", value: "assigned" },
    { label: "In Progress", value: "in_progress" },
    { label: "Resolved", value: "resolved" },
  ];

  const columns = [
    {
      key: "title",
      label: "Task",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.address}</p>
        </div>
      ),
    },
    {
      key: "reporterId",
      label: "Reporter",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <div>
          <p className="text-sm">{item.reporterId?.name || "—"}</p>
          {item.reporterId?.phone && (
            <p className="text-xs text-muted-foreground">{item.reporterId.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => <PriorityBadge priority={item.priority} />,
    },
    {
      key: "status",
      label: "Status",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <StatusBadge status={item.status as ComplaintStatus} />
      ),
    },
    {
      key: "slaDeadline",
      label: "Deadline",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => {
        if (!item.slaDeadline)
          return <span className="text-muted-foreground">-</span>;
        const deadline = new Date(item.slaDeadline);
        const isOverdue = deadline < new Date() && item.status !== "resolved";
        return (
          <span
            className={`text-sm ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}
          >
            {deadline.toLocaleDateString()}
            {isOverdue && " (Overdue)"}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title="My Tasks" description="Tasks assigned to you" />

      <div className="flex gap-2 mb-4 flex-wrap">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        emptyMessage="No tasks found"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRowClick={(item: any) =>
          router.push(`/dashboard/worker/tasks/${item._id}`)
        }
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={fetchTasks}
      />
    </div>
  );
}
