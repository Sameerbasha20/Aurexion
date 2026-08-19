import React from "react";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import type { ApiError } from "../../../api/apiErrorHandler";

export function getErrorMessage(error: ApiError | null): string {
  if (!error) return "An unexpected error occurred.";
  if (error.statusCode === 401) return "Your session has expired. Please sign in again.";
  if (error.statusCode === 403) return "You do not have permission to access this resource.";
  if (error.statusCode === 404) return "The requested resource could not be found.";
  if (error.statusCode === 429) return "Too many requests. Please try again shortly.";
  if (error.statusCode && error.statusCode >= 500)
    return "Something went wrong on our end. Please try again later.";
  return error.message || "An unexpected error occurred.";
}

export interface FieldErrors {
  errors?: Record<string, string[]>;
}

export function getFieldErrors(error: ApiError | null): Record<string, string[]> {
  return error?.errors || {};
}

export const LoadingState: React.FC<{ label?: string; rows?: number }> = ({ label, rows = 3 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }} role="status" aria-label={label || "Loading"}>
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

export const ErrorState: React.FC<{
  error: ApiError | null;
  onRetry?: () => void;
  title?: string;
}> = ({ error, onRetry, title }) => (
  <Alert variant="destructive">
    <AlertCircle />
    <AlertTitle>{title || "Unable to load data"}</AlertTitle>
    <AlertDescription>
      <p>{getErrorMessage(error)}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} style={{ marginTop: "0.5rem" }}>
          <RefreshCw size={14} />
          Retry
        </Button>
      )}
    </AlertDescription>
  </Alert>
);

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.75rem",
      border: "1px dashed rgba(140,174,187,0.3)",
      borderRadius: "8px",
      padding: "3rem 1.5rem",
      textAlign: "center",
      minHeight: "160px",
    }}
  >
    <Inbox size={28} style={{ color: "#64748b" }} />
    <div style={{ fontWeight: 600, fontSize: "1rem" }}>{title}</div>
    {description && (
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, maxWidth: "440px", lineHeight: 1.6 }}>
        {description}
      </p>
    )}
    {action}
  </div>
);