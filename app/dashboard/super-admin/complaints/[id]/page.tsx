"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge, PriorityBadge } from "@/components/shared/status-badge";
import { AlertBanner } from "@/components/shared/alert-banner";
import { MapPin, Calendar, Clock, User, Building2 } from "lucide-react";
import apiClient from "@/lib/api-client";
import type { ComplaintStatus } from "@/types";

export default function SuperAdminComplaintDetail() {
  const { id } = useParams();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [complaint, setComplaint] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [statusLogs, setStatusLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiClient
      .get(`/complaints/${id}`)
      .then(({ data }) => {
        setComplaint(data.data.complaint);
        setStatusLogs(data.data.statusLogs);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load complaint");
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!complaint)
    return <AlertBanner variant="error" message="Complaint not found" />;

  return (
    <div>
      <PageHeader title={complaint.title} />
      {error && <AlertBanner variant="error" message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={complaint.status as ComplaintStatus} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <p className="text-sm whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

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
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Department:</span>
              <span>{complaint.departmentId?.name || "Unassigned"}</span>
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
            <div className="text-sm">
              <span className="text-muted-foreground">Category:</span>{" "}
              {complaint.categoryId?.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
