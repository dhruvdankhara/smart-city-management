"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingButton } from "@/components/shared/loading-button";
import { AlertBanner } from "@/components/shared/alert-banner";
import { DataTable } from "@/components/shared/data-table";
import apiClient from "@/lib/api-client";

export default function WorkerLeave() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const fetchLeaves = async () => {
    try {
      const { data } = await apiClient.get("/leaves");
      setLeaves(data.data.leaves);
    } catch {
      setError("Failed to load leaves");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await apiClient.post("/leaves", form);
      setSuccess(data.message);
      setShowForm(false);
      setForm({ startDate: "", endDate: "", reason: "" });
      fetchLeaves();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to submit leave");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  const columns = [
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
      key: "createdAt",
      label: "Applied On",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (item: any) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Leave Management"
        description="Apply and track your leave requests"
        action={
          <LoadingButton onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Apply for Leave"}
          </LoadingButton>
        }
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

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border bg-card p-5 mb-6 space-y-4 max-w-lg"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Reason for leave..."
              rows={3}
              className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              required
            />
          </div>
          <LoadingButton type="submit" isLoading={isSubmitting}>
            Submit Request
          </LoadingButton>
        </form>
      )}

      <DataTable
        columns={columns}
        data={leaves}
        isLoading={isLoading}
        emptyMessage="No leave requests found"
      />
    </div>
  );
}
