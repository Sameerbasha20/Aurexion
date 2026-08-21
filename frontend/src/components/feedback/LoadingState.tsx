import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  compact?: boolean;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading data...",
  compact = false,
  className = "",
}) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-3 text-xs text-muted-foreground ${className}`} style={{ color: "#8da5ae" }}>
        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className={`p-8 my-4 rounded-lg border border-cyan-500/10 text-center flex flex-col items-center justify-center min-h-[180px] ${className}`}
      style={{
        backgroundColor: "rgba(6, 12, 24, 0.4)",
        borderColor: "rgba(99, 245, 232, 0.1)",
      }}
    >
      <Loader2 className="w-7 h-7 animate-spin text-cyan-400 mb-3" style={{ color: "#63f5e8" }} />
      <p className="text-xs font-mono tracking-wider text-muted-foreground uppercase" style={{ color: "#8da5ae" }}>
        {message}
      </p>
    </div>
  );
};

export default LoadingState;
