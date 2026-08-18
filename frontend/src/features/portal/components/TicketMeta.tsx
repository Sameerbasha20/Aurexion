import React from "react";
import type { TicketCategory, TicketPriority, TicketStatus } from "../types/portal.types";

interface TagColors {
  fg: string;
  bg: string;
  border: string;
  label: string;
}

const STATUS_COLORS: Record<TicketStatus, TagColors> = {
  open: { fg: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.35)", label: "Open" },
  assigned: { fg: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.35)", label: "Assigned" },
  in_progress: { fg: "#63f5e8", bg: "rgba(99,245,232,0.1)", border: "rgba(99,245,232,0.35)", label: "In Progress" },
  awaiting_client: { fg: "#c4b5fd", bg: "rgba(196,181,253,0.1)", border: "rgba(196,181,253,0.35)", label: "Awaiting Client" },
  resolved: { fg: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.35)", label: "Resolved" },
  closed: { fg: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.35)", label: "Closed" },
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  bug: "Bug",
  enhancement: "Enhancement",
  security: "Security",
  infrastructure: "Infrastructure",
  general: "General",
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const PRIORITY_COLORS: Record<TicketPriority, TagColors> = {
  low: { fg: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.35)", label: "Low" },
  medium: { fg: "#60a5fa", bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.35)", label: "Medium" },
  high: { fg: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.35)", label: "High" },
  critical: { fg: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.35)", label: "Critical" },
};

export function ticketStatusLabel(status: TicketStatus): string {
  return STATUS_COLORS[status]?.label || status;
}

export function ticketCategoryLabel(category: TicketCategory): string {
  return CATEGORY_LABELS[category] || category;
}

export function ticketPriorityLabel(priority: TicketPriority): string {
  return PRIORITY_COLORS[priority]?.label || priority;
}

export const TicketStatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.open;
  return (
    <span
      style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "0.7rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: colors.fg,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        padding: "0.2rem 0.5rem",
        borderRadius: "4px",
        whiteSpace: "nowrap",
      }}
    >
      {colors.label}
    </span>
  );
};

export const TicketPriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  return (
    <span
      style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "0.7rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: colors.fg,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        padding: "0.2rem 0.5rem",
        borderRadius: "4px",
        whiteSpace: "nowrap",
      }}
    >
      {colors.label}
    </span>
  );
};

export const TicketCategoryBadge: React.FC<{ category: TicketCategory }> = ({ category }) => {
  return (
    <span
      style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: "0.7rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#cbd5e1",
        backgroundColor: "rgba(148,163,184,0.08)",
        border: "1px solid rgba(148,163,184,0.25)",
        padding: "0.2rem 0.5rem",
        borderRadius: "4px",
        whiteSpace: "nowrap",
      }}
    >
      {ticketCategoryLabel(category)}
    </span>
  );
};