import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { ApiError } from "@/api/apiErrorHandler";

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: ApiError | Error | string | null;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Failed to load data",
  message,
  error,
  onRetry,
  compact = false,
  className = "",
}) => {
  let displayMessage = message;

  if (!displayMessage) {
    if (error instanceof ApiError) {
      displayMessage = error.userMessage || error.message;
    } else if (error instanceof Error) {
      displayMessage = error.message;
    } else if (typeof error === "string") {
      displayMessage = error;
    } else {
      displayMessage = "An unexpected error occurred while fetching information.";
    }
  }

  if (compact) {
    return (
      <div
        className={`p-4 rounded-md border border-destructive/30 bg-destructive/10 text-destructive-foreground flex items-center justify-between gap-3 text-sm ${className}`}
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.08)",
          borderColor: "rgba(239, 68, 68, 0.25)",
          color: "#f87171",
        }}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
          <span>{displayMessage}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-2.5 py-1 text-xs font-mono rounded border border-red-500/40 hover:bg-red-500/20 transition-colors flex items-center gap-1 cursor-pointer text-red-300"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`p-8 my-4 rounded-lg border border-red-500/20 bg-background/50 text-center flex flex-col items-center justify-center min-h-[220px] ${className}`}
      style={{
        backgroundColor: "rgba(6, 12, 24, 0.7)",
        borderColor: "rgba(239, 68, 68, 0.2)",
      }}
    >
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-lg font-medium text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground max-w-md mb-5 leading-relaxed" style={{ color: "#8da5ae" }}>
        {displayMessage}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 text-xs font-mono uppercase tracking-wider rounded border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-colors flex items-center gap-2 cursor-pointer"
          style={{
            borderColor: "rgba(99, 245, 232, 0.4)",
            color: "#63f5e8",
          }}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Request
        </button>
      )}
    </div>
  );
};

export default ErrorState;
