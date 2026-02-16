import type { ComplaintStatus } from "@/types";

const statusConfig: Record<
  ComplaintStatus,
  { label: string; className: string }
> = {
  reported: {
    label: "Reported",
    className: "bg-blue-100 text-blue-800",
  },
  assigned: {
    label: "Assigned",
    className: "bg-yellow-100 text-yellow-800",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-purple-100 text-purple-800",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-100 text-green-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-800",
  },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-slate-100 text-slate-700" },
  medium: { label: "Medium", className: "bg-blue-100 text-blue-700" },
  high: { label: "High", className: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", className: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] || priorityConfig.medium;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
