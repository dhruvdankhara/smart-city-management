"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { LoadingButton } from "@/components/shared/loading-button";
import { AlertBanner } from "@/components/shared/alert-banner";
import { MapPin, Calendar, Clock, User } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { ComplaintStatus } from "@/types";

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [complaint, setComplaint] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [statusLogs, setStatusLogs] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [assignForm, setAssignForm] = useState({
    assignedWorkerId: "",
    slaDeadline: "",
    priority: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintRes, usersRes] = await Promise.all([
          apiClient.get(`/complaints/${id}`),
          apiClient.get("/users?role=worker&limit=100"),
        ]);
        setComplaint(complaintRes.data.data.complaint);
        setStatusLogs(complaintRes.data.data.statusLogs);
        setWorkers(usersRes.data.data.users);
      } catch {
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.assignedWorkerId || !assignForm.slaDeadline) {
      setError("Worker and deadline are required");
      return;
    }

    setIsAssigning(true);
    setError("");
    try {
      const { data } = await apiClient.post(`/complaints/${id}/assign`, {
        ...assignForm,
        priority: assignForm.priority || undefined,
      });
      setSuccess(data.message);
      if (data.data.suggestion) {
        setSuccess((prev) => `${prev}. Tip: ${data.data.suggestion}`);
      }
      setTimeout(() => router.push("/dashboard/admin/complaints"), 2000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to assign");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this complaint?")) return;
    try {
      await apiClient.patch(`/complaints/${id}`, {
        status: "rejected",
        note: "Rejected by department admin",
      });
      router.push("/dashboard/admin/complaints");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to reject");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!complaint)
    return <AlertBanner variant="error" message="Complaint not found" />;

  const canAssign = ["reported", "assigned"].includes(complaint.status);
  const canReject = complaint.status === "reported";

  return (
    <div>
      <PageHeader title={complaint.title} />

      {error && (
        <AlertBanner
          variant="error"
          message={error}
          onClose={() => setError("")}
        />
      )}
      {success && <AlertBanner variant="success" message={success} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Info */}
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={complaint.status as ComplaintStatus} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <p className="text-sm whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* Images */}
          {complaint.images?.length > 0 && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {complaint.images.map((img: any, i: number) => (
                  <a
                    key={i}
                    href={img.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg overflow-hidden border aspect-square"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Assign Form */}
          {canAssign && (
            <form
              onSubmit={handleAssign}
              className="rounded-xl border bg-card p-5 space-y-4"
            >
              <h3 className="text-sm font-semibold">Assign to Worker</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Worker</label>
                <select
                  value={assignForm.assignedWorkerId}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      assignedWorkerId: e.target.value,
                    })
                  }
                  className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                >
                  <option value="">Select worker</option>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {workers.map((w: any) => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">SLA Deadline</label>
                <input
                  type="date"
                  value={assignForm.slaDeadline}
                  onChange={(e) =>
                    setAssignForm({
                      ...assignForm,
                      slaDeadline: e.target.value,
                    })
                  }
                  className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Override Priority (optional)
                </label>
                <select
                  value={assignForm.priority}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, priority: e.target.value })
                  }
                  className="flex h-10 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Keep current</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex gap-3">
                <LoadingButton type="submit" isLoading={isAssigning}>
                  Assign Worker
                </LoadingButton>
                {canReject && (
                  <LoadingButton
                    type="button"
                    variant="destructive"
                    onClick={handleReject}
                  >
                    Reject
                  </LoadingButton>
                )}
              </div>
            </form>
          )}

          {/* Timeline */}
          <div className="rounded-xl border bg-card p-5">
            <h3 className="text-sm font-semibold mb-4">Status History</h3>
            <div className="space-y-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {statusLogs.map((log: any, index: number) => (
                <div key={log._id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    {index < statusLogs.length - 1 && (
                      <div className="w-px flex-1 bg-border" />
                    )}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={log.newStatus} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {log.note && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.note}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      by {log.changedBy?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Details</h3>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Filed:</span>
              <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="truncate">{complaint.address}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Reporter:</span>
              <span>
                {complaint.reporterId?.name} ({complaint.reporterId?.phone})
              </span>
            </div>

            {complaint.assignedWorkerId && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Worker:</span>
                <span>{complaint.assignedWorkerId.name}</span>
              </div>
            )}

            {complaint.slaDeadline && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Deadline:</span>
                <span>
                  {new Date(complaint.slaDeadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
