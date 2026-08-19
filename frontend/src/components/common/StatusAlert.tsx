import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface StatusAlertProps {
  success?: string | null;
  error?: string | null;
  style?: React.CSSProperties;
}

export const StatusAlert: React.FC<StatusAlertProps> = ({ success, error, style }) => {
  if (success) {
    return (
      <div
        style={{
          backgroundColor: "rgba(74, 222, 128, 0.1)",
          border: "1px solid rgba(74, 222, 128, 0.3)",
          color: "#4ade80",
          padding: "0.75rem 1rem",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.85rem",
          marginBottom: "1.5rem",
          ...style,
        }}
      >
        <CheckCircle size={16} />
        <span>{success}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          color: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          padding: "0.75rem",
          borderRadius: "4px",
          marginBottom: "1rem",
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          ...style,
        }}
      >
        <AlertCircle size={16} />
        <span>{error}</span>
      </div>
    );
  }

  return null;
};
