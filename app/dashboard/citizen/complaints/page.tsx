"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { AlertBanner } from "@/components/shared/alert-banner";
import apiClient from "@/lib/api-client";
import Link from "next/link";
import { FileText } from "lucide-react";
import type { ComplaintStatus } from "@/types";

export default function CitizenComplaints() {
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
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchComplaints = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await apiClient.get(`/complaints?${params}`);
      setComplaints(data.data.complaints);
      setPagination(data.data.pagination);
    } catch {
      setError("Failed to load complaints");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const columns = [
    {
      key: "title",
      label: "Title",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => (
        <div>
          <p className="font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {item.categoryId?.name}
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

  const statusOptions: { label: string; value: string }[] = [
    { label: "All", value: "" },
    { label: "Reported", value: "reported" },
    { label: "Assigned", value: "assigned" },
    { label: "In Progress", value: "in_progress" },
    { label: "Resolved", value: "resolved" },
    { label: "Rejected", value: "rejected" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div>
      <PageHeader
        title="My Complaints"
        description="View and manage your filed complaints"
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

      {/* Filters */}
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
        data={complaints}
        isLoading={isLoading}
        emptyMessage="No complaints found"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onRowClick={(item: any) =>
          router.push(`/dashboard/citizen/complaints/${item._id}`)
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
