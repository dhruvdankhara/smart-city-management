"use client";

import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertBannerProps {
  variant: AlertVariant;
  message: string;
  onClose?: () => void;
}

const variantConfig: Record<
  AlertVariant,
  { icon: typeof AlertCircle; className: string }
> = {
  success: {
    icon: CheckCircle,
    className: "bg-green-50 text-green-800 border-green-200",
  },
  error: {
    icon: XCircle,
    className: "bg-red-50 text-red-800 border-red-200",
  },
  warning: {
    icon: AlertCircle,
    className: "bg-yellow-50 text-yellow-800 border-yellow-200",
  },
  info: {
    icon: Info,
    className: "bg-blue-50 text-blue-800 border-blue-200",
  },
};

export function AlertBanner({ variant, message, onClose }: AlertBannerProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-4 ${config.className}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-md p-1 hover:bg-black/5"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
