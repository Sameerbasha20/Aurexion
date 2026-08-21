import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Button from "../ui/button";

interface QueryErrorBannerProps {
  error: any;
  onRetry?: () => void;
  title?: string;
}

export const QueryErrorBanner: React.FC<QueryErrorBannerProps> = ({ error, onRetry, title }) => {
  const errorMessage =
    error?.userMessage || error?.message || "Failed to communicate with Aurexion server endpoints.";

  return (
    <div className="flex items-start space-x-3 p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-red-200 my-4">
      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 text-sm">
        <h4 className="font-semibold text-red-300">{title || "API Communication Error"}</h4>
        <p className="mt-1 text-red-300/80">{errorMessage}</p>
        {error?.statusCode && (
          <span className="inline-block mt-2 px-2 py-0.5 text-xs font-mono bg-red-900/50 rounded border border-red-800/50 text-red-300">
            HTTP {error.statusCode}
          </span>
        )}
      </div>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="border-red-800/50 text-red-300 hover:bg-red-900/40 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
};

export default QueryErrorBanner;
