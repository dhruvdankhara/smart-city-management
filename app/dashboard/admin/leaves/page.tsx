"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { AlertBanner } from "@/components/shared/alert-banner";
import apiClient from "@/lib/api-client";

export default function AdminLeaves() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await apiClient.get(`/leaves?${params}`);
      setLeaves(data.data.leaves);
    } catch {
      setError("Failed to load leaves");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleAction = async (
    leaveId: string,
    status: "approved" | "rejected",
  ) => {
    try {
      await apiClient.patch(`/leaves/${leaveId}`, { status });
      setSuccess(`Leave request ${status}`);
      fetchLeaves();
    } catch {
      setError("Failed to update leave");
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const columns = [
    {
      key: "workerId",
      label: "Worker",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => item.workerId?.name || "Unknown",
    },
    {
      key: "startDate",
      label: "From",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => new Date(item.startDate).toLocaleDateString(),
    },
    {
      key: "endDate",
      label: "To",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => new Date(item.endDate).toLocaleDateString(),
    },
    { key: "reason", label: "Reason" },
    {
      key: "status",
      label: "Status",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[item.status]}`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => {
        if (item.status !== "pending") return null;
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(item._id, "approved");
              }}
              className="text-xs px-2 py-1 rounded border text-green-600 hover:bg-green-50"
            >
              Approve
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAction(item._id, "rejected");
              }}
              className="text-xs px-2 py-1 rounded border text-red-600 hover:bg-red-50"
            >
              Reject
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Leave Requests"
        description="Approve or reject worker leave requests"
      />

      {error && (
        <AlertBanner
          variant="error"
          message={error}
          onClose={() => setError("")}
        />
      )}
      {success && (
        <AlertBanner
          variant="success"
          message={success}
          onClose={() => setSuccess("")}
        />
      )}

      <div className="flex gap-2 mb-4">
        {["pending", "approved", "rejected", ""].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={leaves}
        isLoading={isLoading}
        emptyMessage="No leave requests"
      />
    </div>
  );
}
