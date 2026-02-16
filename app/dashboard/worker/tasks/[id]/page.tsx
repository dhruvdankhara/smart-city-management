"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { LoadingButton } from "@/components/shared/loading-button";
import { AlertBanner } from "@/components/shared/alert-banner";
import { ImageUpload } from "@/components/shared/image-upload";
import { MapPin, Calendar, Clock } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { ComplaintStatus } from "@/types";

export default function WorkerTaskDetail() {
  const { id } = useParams();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [task, setTask] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [statusLogs, setStatusLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [note, setNote] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await apiClient.get(`/complaints/${id}`);
        setTask(data.data.complaint);
        setStatusLogs(data.data.statusLogs);
      } catch {
        setError("Failed to load task");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const updateStatus = async (newStatus: "in_progress" | "resolved") => {
    setIsUpdating(true);
    setError("");
    setSuccess("");
    try {
      // Upload images first if resolving with proof
      if (images.length > 0) {
        for (const img of images) {
          await apiClient.post("/upload", {
            image: img,
            folder: "resolutions",
          });
        }
      }

      await apiClient.patch(`/complaints/${id}`, {
        status: newStatus,
        note: note || `Status updated to ${newStatus}`,
      });

      setSuccess(`Task marked as ${newStatus.replace("_", " ")}`);
      // Refresh after a moment
      setTimeout(() => {
        router.push("/dashboard/worker/tasks");
      }, 1500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!task) {
    return <AlertBanner variant="error" message="Task not found" />;
  }

  const isOverdue =
    task.slaDeadline &&
    new Date(task.slaDeadline) < new Date() &&
    task.status !== "resolved";

  return (
    <div>
      <PageHeader title={task.title} backHref="/dashboard/worker/tasks" />

      {error && (
        <AlertBanner
          variant="error"
          message={error}
          onClose={() => setError("")}
        />
      )}
      {success && <AlertBanner variant="success" message={success} />}
      {isOverdue && (
        <div className="mb-4">
          <AlertBanner
            variant="warning"
            message="This task has passed its SLA deadline!"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={task.status as ComplaintStatus} />
              <PriorityBadge priority={task.priority} />
            </div>
            <p className="text-sm whitespace-pre-wrap">{task.description}</p>
          </div>

          {/* Complaint Images */}
          {task.images?.length > 0 && (
            <div className="rounded-xl border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Complaint Photos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {task.images.map((img: any, i: number) => (
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

          {/* Update Status */}
          {["assigned", "in_progress"].includes(task.status) && (
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <h3 className="text-sm font-semibold">Update Status</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note about the work done..."
                  rows={3}
                  className="flex w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Upload Proof (optional)
                </label>
                <ImageUpload
                  images={images}
                  onChange={setImages}
                  maxFiles={3}
                />
              </div>

              <div className="flex gap-3">
                {task.status === "assigned" && (
                  <LoadingButton
                    isLoading={isUpdating}
                    onClick={() => updateStatus("in_progress")}
                  >
                    Start Working
                  </LoadingButton>
                )}
                {["assigned", "in_progress"].includes(task.status) && (
                  <LoadingButton
                    isLoading={isUpdating}
                    onClick={() => updateStatus("resolved")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Mark Resolved
                  </LoadingButton>
                )}
              </div>
            </div>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold">Task Details</h3>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Reported:</span>
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="truncate">{task.address}</span>
            </div>

            {task.slaDeadline && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Deadline:</span>
                <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                  {new Date(task.slaDeadline).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="text-sm">
              <span className="text-muted-foreground">Reporter:</span>{" "}
              {task.reporterId?.name} ({task.reporterId?.phone})
            </div>

            <div className="text-sm">
              <span className="text-muted-foreground">Category:</span>{" "}
              {task.categoryId?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
