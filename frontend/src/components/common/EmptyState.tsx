import React from "react";
import { FolderOpen, SearchX, RefreshCw } from "lucide-react";
import Button from "../ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
  isSearchEmpty?: boolean;
  onReset?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  isSearchEmpty = false,
  onReset,
  actionLabel,
  onAction,
}) => {
  const Icon = isSearchEmpty ? SearchX : FolderOpen;

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800/80 rounded-xl bg-slate-900/30 my-4">
      <div className="p-4 rounded-full bg-slate-800/50 text-slate-400 mb-4 border border-slate-700/50">
        <Icon className="w-8 h-8 text-cyan-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-1">
        {title || (isSearchEmpty ? "No matching records found" : "No data available yet")}
      </h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        {description ||
          (isSearchEmpty
            ? "Try adjusting your search criteria, filter options, or query terms."
            : "There are no records established in this module view.")}
      </p>
      <div className="flex items-center space-x-3">
        {isSearchEmpty && onReset && (
          <Button variant="outline" size="sm" onClick={onReset} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Clear Search & Filters
          </Button>
        )}
        {actionLabel && onAction && (
          <Button size="sm" onClick={onAction} className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
