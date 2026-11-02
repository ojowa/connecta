"use client";

import { AlertCircle } from "lucide-react";
import { ApiError, formatApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ErrorBannerProps {
  error: unknown;
  className?: string;
}

export function ErrorBanner({ error, className }: ErrorBannerProps) {
  if (!error) return null;

  const message = error instanceof ApiError ? error.message : formatApiError(error);
  const status = error instanceof ApiError ? error.status : undefined;
  const code = error instanceof ApiError ? error.code : undefined;
  const details = error instanceof ApiError ? error.errors : undefined;
  const requestId = error instanceof ApiError ? error.requestId : undefined;

  return (
    <div className={cn("rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800", className)}>
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium">{message}</p>
          {(code || status) && (
            <p className="text-xs text-red-700/80">
              {code ? `Code: ${code}` : null}
              {code && status ? " · " : null}
              {status ? `HTTP ${status}` : null}
            </p>
          )}
          {details && details.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-4 text-xs">
              {details.map((detail, index) => (
                <li key={`${detail}-${index}`}>{detail}</li>
              ))}
            </ul>
          )}
          {requestId && <p className="text-xs text-red-700/60">Request ID: {requestId}</p>}
        </div>
      </div>
    </div>
  );
}
