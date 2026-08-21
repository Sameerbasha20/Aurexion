import React from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data found",
  message = "There are no items matching your request at this time.",
  action,
  className = "",
  icon,
}) => {
  return (
    <div
      className={`p-8 my-4 rounded-lg border border-border/40 text-center flex flex-col items-center justify-center min-h-[200px] ${className}`}
      style={{
        backgroundColor: "rgba(6, 12, 24, 0.4)",
        borderColor: "rgba(99, 245, 232, 0.12)",
      }}
    >
      <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3 text-cyan-400">
        {icon || <FolderOpen className="w-6 h-6 text-cyan-400" />}
      </div>
      <h4 className="text-base font-medium text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-sm mb-4" style={{ color: "#8da5ae" }}>
        {message}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
          style={{
            borderColor: "rgba(99, 245, 232, 0.4)",
            color: "#63f5e8",
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
