"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import apiClient from "@/lib/api-client";
import type { ComplaintStatus } from "@/types";

export default function SuperAdminComplaints() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [complaints, setComplaints] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [departments, setDepartments] = useState<any[]>([]);
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
    departmentId: "",
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
      if (filters.departmentId)
        params.set("departmentId", filters.departmentId);
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
    apiClient.get("/departments").then(({ data }) => setDepartments(data.data));
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const columns = [
    {
      key: "title",
      label: "Complaint",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {item.categoryId?.name} &middot; {item.reporterId?.name}
          </p>
        </div>
      ),
    },
    {
      key: "departmentId",
      label: "Department",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => item.departmentId?.name || "Unassigned",
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
        title="All Complaints"
        description="System-wide complaint management"
      />

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex gap-2 flex-wrap">
          {[
            "",
            "reported",
            "assigned",
            "in_progress",
            "resolved",
            "rejected",
            "cancelled",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setFilters({ ...filters, status: s })}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filters.status === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
        <select
          value={filters.departmentId}
          onChange={(e) =>
            setFilters({ ...filters, departmentId: e.target.value })
          }
          className="rounded-lg border bg-background px-3 py-1.5 text-xs"
        >
          <option value="">All Departments</option>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {departments.map((d: any) => (
            <option key={d._id} value={d._id}>
              {d.name}
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
          router.push(`/dashboard/super-admin/complaints/${item._id}`)
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
