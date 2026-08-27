import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "../ui/button";

export interface QueryErrorProp {
  userMessage?: string;
  message?: string;
  statusCode?: number;
}

interface QueryErrorBannerProps {
  error: QueryErrorProp | Error | unknown;
  onRetry?: () => void;
  title?: string;
}

export const QueryErrorBanner: React.FC<QueryErrorBannerProps> = ({
  error,
  onRetry,
  title = "Failed to load data",
}) => {
  const err = (error || {}) as QueryErrorProp;
  const message =
    err.userMessage ||
    err.message ||
    "An error occurred while fetching information from the server.";

  return (
    <div
      role="alert"
      className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 backdrop-blur-md flex items-start justify-between gap-4 my-3 text-red-200"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-semibold text-red-300 font-mono uppercase tracking-wider">
            {title} {err.statusCode ? `(${err.statusCode})` : ""}
          </h4>
          <p className="text-xs text-red-200/80 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-red-500/30 hover:bg-red-500/20 text-red-300 text-xs font-mono flex items-center gap-1.5 flex-shrink-0 h-8"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RETRY</span>
        </Button>
      )}
    </div>
  );
};

export default QueryErrorBanner;
