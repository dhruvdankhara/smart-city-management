"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import apiClient from "@/lib/api-client";
import type { ComplaintStatus } from "@/types";

export default function AdminComplaints() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [complaints, setComplaints] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    sort: "-createdAt",
  });

  const fetchComplaints = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        sort: filters.sort,
      });
      if (filters.status) params.set("status", filters.status);
      if (filters.priority) params.set("priority", filters.priority);
      const { data } = await apiClient.get(`/complaints?${params}`);
      setComplaints(data.data.complaints);
      setPagination(data.data.pagination);
    } catch {
      // handle
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const statusOptions = [
    { label: "All", value: "" },
    { label: "Reported", value: "reported" },
    { label: "Assigned", value: "assigned" },
    { label: "In Progress", value: "in_progress" },
    { label: "Resolved", value: "resolved" },
    { label: "Rejected", value: "rejected" },
  ];

  const sortOptions = [
    { label: "Newest", value: "-createdAt" },
    { label: "Oldest", value: "createdAt" },
    { label: "Priority", value: "-priority" },
  ];

  const columns = [
    {
      key: "title",
      label: "Complaint",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {item.categoryId?.name} &middot; by {item.reporterId?.name}
          </p>
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
      key: "assignedWorkerId",
      label: "Worker",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <span className="text-sm">
          {item.assignedWorkerId?.name || "Unassigned"}
        </span>
      ),
    },
    {
      key: "slaDeadline",
      label: "Deadline",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => {
        if (!item.slaDeadline)
          return <span className="text-muted-foreground">-</span>;
        const d = new Date(item.slaDeadline);
        const overdue =
          d < new Date() &&
          !["resolved", "cancelled", "rejected"].includes(item.status);
        return (
          <span
            className={`text-sm ${overdue ? "text-red-600 font-medium" : ""}`}
          >
            {d.toLocaleDateString()}
            {overdue && " !"}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <span className="text-sm text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Complaints"
        description="Manage and assign department complaints"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex gap-2 flex-wrap">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilters({ ...filters, status: opt.value })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.status === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          className="rounded-lg border bg-background px-3 py-1.5 text-xs"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={complaints}
        isLoading={isLoading}
        emptyMessage="No complaints found"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRowClick={(item: any) =>
          router.push(`/dashboard/admin/complaints/${item._id}`)
        }
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={fetchComplaints}
      />
    </div>
  );
}
