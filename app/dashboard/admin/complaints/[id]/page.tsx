"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { LoadingButton } from "@/components/shared/loading-button";
import { AlertBanner } from "@/components/shared/alert-banner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Calendar, Clock, User, CheckCircle2 } from "lucide-react";
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
  const [workerTaskCounts, setWorkerTaskCounts] = useState<
    Record<string, { active: number; total: number; resolved: number }>
  >({});
  const [workersOnLeave, setWorkersOnLeave] = useState<Set<string>>(new Set());
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
        const [complaintRes, usersRes, dashRes, leavesRes] = await Promise.all([
          apiClient.get(`/complaints/${id}`),
          apiClient.get("/users?role=worker&limit=100"),
          apiClient.get("/dashboard?timeframe=year"),
          apiClient.get("/leaves?status=approved&limit=100"),
        ]);
        setComplaint(complaintRes.data.data.complaint);
        setStatusLogs(complaintRes.data.data.statusLogs);
        setWorkers(usersRes.data.data.users);

        // Build set of worker IDs currently on leave
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const onLeaveIds = new Set<string>();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        leavesRes.data.data.leaves?.forEach((leave: any) => {
          const start = new Date(leave.startDate);
          const end = new Date(leave.endDate);
          if (start <= today && end >= today && leave.workerId?._id) {
            onLeaveIds.add(leave.workerId._id.toString());
          }
        });
        setWorkersOnLeave(onLeaveIds);

        // Build worker task count map from dashboard workerStats
        const taskMap: Record<
          string,
          { active: number; total: number; resolved: number }
        > = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dashRes.data.data.workerStats?.forEach((ws: any) => {
          if (ws._id) {
            taskMap[ws._id.toString()] = {
              active: ws.active || 0,
              total: ws.total || 0,
              resolved: ws.resolved || 0,
            };
          }
        });
        setWorkerTaskCounts(taskMap);
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

  const canAssign = complaint.status === "reported";
  const canReject = complaint.status === "reported";

  return (
    <div>
      <PageHeader
        title={complaint.title}
        backHref="/dashboard/admin/complaints"
      />

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
            <Card>
              <CardHeader>
                <CardTitle>Assign to Worker</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAssign} className="space-y-5">
                  {/* Worker Selection - Card-based */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Select Worker
                    </label>
                    <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {workers.map((w: any) => {
                        const isSelected =
                          assignForm.assignedWorkerId === w._id;
                        const isOnLeave = workersOnLeave.has(w._id);
                        const taskInfo = workerTaskCounts[w._id] || {
                          active: 0,
                          total: 0,
                          resolved: 0,
                        };
                        return (
                          <button
                            key={w._id}
                            type="button"
                            disabled={isOnLeave}
                            onClick={() =>
                              setAssignForm({
                                ...assignForm,
                                assignedWorkerId: w._id,
                              })
                            }
                            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                              isOnLeave
                                ? "border-border opacity-50 cursor-not-allowed bg-muted/30"
                                : isSelected
                                  ? "border-primary ring-2 ring-primary/20 bg-primary/5 hover:bg-primary/5"
                                  : "border-border hover:bg-accent/50"
                            }`}
                          >
                            {/* Avatar */}
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                              {w.avatar?.url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={w.avatar.url}
                                  alt={w.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-primary">
                                  {w.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">
                                  {w.name}
                                </p>
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {w.email}
                              </p>
                            </div>

                            {/* Task count badges */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {isOnLeave ? (
                                <Badge variant="destructive">On Leave</Badge>
                              ) : (
                                <>
                                  <Badge
                                    variant={
                                      taskInfo.active > 0
                                        ? "secondary"
                                        : "outline"
                                    }
                                  >
                                    {taskInfo.active} active
                                  </Badge>
                                  <Badge variant="outline">
                                    {taskInfo.resolved} done
                                  </Badge>
                                </>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      {workers.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                          No workers available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SLA Deadline */}
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
                      className="flex h-9 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </div>

                  {/* Override Priority */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Override Priority (optional)
                    </label>
                    <Select
                      value={assignForm.priority}
                      onValueChange={(val) =>
                        setAssignForm({ ...assignForm, priority: val })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Keep current" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
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
              </CardContent>
            </Card>
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
