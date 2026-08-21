import React from "react";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, cols = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      {/* Table Header Skeleton */}
      <div className="h-10 bg-slate-800/60 rounded-lg w-full mb-4 flex items-center px-4 space-x-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-slate-700/50 rounded flex-1" />
        ))}
      </div>
      {/* Table Row Skeletons */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="h-14 bg-slate-900/40 border border-slate-800/40 rounded-lg flex items-center px-4 space-x-4"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`h-4 bg-slate-800/50 rounded ${
                colIndex === 0 ? "w-1/4" : "flex-1"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
