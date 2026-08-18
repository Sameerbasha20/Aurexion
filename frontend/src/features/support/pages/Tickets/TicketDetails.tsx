import React, { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft, Save, UserCheck, ShieldAlert, CheckCircle2, LifeBuoy, FileText } from "lucide-react";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { ErrorState, LoadingState, getErrorMessage } from "../../../portal/components/StateViews";
import { TicketCategoryBadge, TicketPriorityBadge, TicketStatusBadge, ticketCategoryLabel, ticketPriorityLabel } from "../../../portal/components/TicketMeta";
import { formatDateTime } from "../../../portal/utils/format";
import type { TicketCategory, TicketPriority, TicketStatus } from "../../../portal/types/portal.types";
import useExecutiveTicket from "../../hooks/useExecutiveTicket";
import useUpdateExecutiveTicket from "../../hooks/useUpdateExecutiveTicket";
import useAssignableUsers from "../../hooks/useAssignableUsers";

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_client", label: "Awaiting Client Response" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "general", label: "General Inquiry" },
  { value: "bug", label: "Bug Report" },
  { value: "enhancement", label: "Enhancement" },
  { value: "security", label: "Security" },
  { value: "infrastructure", label: "Infrastructure" },
];

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div>
    <div style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>
      {label}
    </div>
    <div style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#e2e8f0" }}>{value}</div>
  </div>
);

export const TicketDetails: React.FC = () => {
  const params = useParams();
  const ticketId = params?.id || "";
  const ticket = useExecutiveTicket(ticketId);
  const updateTicket = useUpdateExecutiveTicket();
  const assignableUsers = useAssignableUsers();

  const [status, setStatus] = useState<TicketStatus>("open");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [category, setCategory] = useState<TicketCategory>("general");
  const [assignedToId, setAssignedToId] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState(false);

  useEffect(() => {
    if (ticket.data) {
      setStatus(ticket.data.status);
      setPriority(ticket.data.priority);
      setCategory(ticket.data.category);
      setAssignedToId(ticket.data.assigned_to_id);
      setResolutionNotes(ticket.data.resolution_notes || "");
    }
  }, [ticket.data]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.data) return;

    try {
      await updateTicket.update(ticket.data.id, {
        status,
        priority,
        category,
        assigned_to: assignedToId,
        resolution_notes: resolutionNotes.trim(),
      });
      setSuccessMessage(true);
      ticket.refetch();
      window.setTimeout(() => setSuccessMessage(false), 3000);
    } catch {
      // Error in updateTicket.error
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <Link href="/support/tickets">
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#63f5e8", fontSize: "0.85rem", cursor: "pointer" }}>
            <ArrowLeft size={14} />
            Back to tickets queue
          </span>
        </Link>
      </div>

      {ticket.isLoading ? (
        <LoadingState rows={5} label="Loading ticket details..." />
      ) : ticket.isError ? (
        <ErrorState error={ticket.error} onRetry={ticket.refetch} title="Unable to load ticket details" />
      ) : ticket.data ? (
        <>
          {/* Ticket Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontSize: "0.9rem" }}>
                  {ticket.data.ticket_id}
                </span>
                <TicketStatusBadge status={ticket.data.status} />
                <TicketPriorityBadge priority={ticket.data.priority} />
                <TicketCategoryBadge category={ticket.data.category} />
              </div>
              <h1 style={{ fontSize: "1.8rem", margin: 0, fontFamily: "var(--font-display)", fontWeight: 600, color: "#f8fafc" }}>
                {ticket.data.subject}
              </h1>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.35rem 0 0 0" }}>
                Transmitted by <strong style={{ color: "#e2e8f0" }}>{ticket.data.client_user}</strong> · opened on {formatDateTime(ticket.data.created_at)}
              </p>
            </div>
          </div>

          {successMessage && (
            <div style={{ color: "#4ade80", backgroundColor: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={16} /> Ticket updated successfully.
            </div>
          )}

          {updateTicket.error && (
            <div style={{ color: "#f87171", backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", padding: "0.75rem 1rem", borderRadius: "6px", fontSize: "0.85rem" }}>
              {getErrorMessage(updateTicket.error)}
            </div>
          )}

          {/* Grid Layout: Information & Actions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {/* Ticket Info Card */}
            <Card glowOnHover>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#63f5e8", marginBottom: "1rem" }}>
                <LifeBuoy size={18} />
                <h3 style={{ margin: 0, color: "#63f5e8" }}>Ticket Metadata</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <InfoRow label="Ticket ID" value={ticket.data.ticket_id} />
                <InfoRow label="Client Account" value={ticket.data.client_user} />
                <InfoRow label="Current Assignee" value={ticket.data.assigned_to || "Unassigned"} />
                <InfoRow label="Created Date" value={formatDateTime(ticket.data.created_at)} />
                <InfoRow label="Last Update" value={formatDateTime(ticket.data.updated_at)} />
                <InfoRow label="Closed Date" value={ticket.data.closed_at ? formatDateTime(ticket.data.closed_at) : "Active"} />
              </div>
            </Card>

            {/* Management & Status Control Card */}
            <Card glowOnHover>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#63f5e8", marginBottom: "1rem" }}>
                <UserCheck size={18} />
                <h3 style={{ margin: 0, color: "#63f5e8" }}>Executive Control Workspace</h3>
              </div>
              <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {/* Status Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <Label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
                    WORKFLOW STATUS
                  </Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
                    <SelectTrigger style={{ width: "100%" }}>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <Label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
                    PRIORITY LEVEL
                  </Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                    <SelectTrigger style={{ width: "100%" }}>
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <Label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
                    ISSUE CATEGORY
                  </Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                    <SelectTrigger style={{ width: "100%" }}>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee Selection */}
                {assignableUsers.data && assignableUsers.data.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <Label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
                      ASSIGNED EXECUTIVE
                    </Label>
                    <Select
                      value={assignedToId ? String(assignedToId) : "unassigned"}
                      onValueChange={(v) => setAssignedToId(v === "unassigned" ? null : Number(v))}
                    >
                      <SelectTrigger style={{ width: "100%" }}>
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {assignableUsers.data.map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.first_name || u.last_name ? `${u.first_name} ${u.last_name} (${u.username})` : u.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form>
            </Card>
          </div>

          {/* Resolution Notes Editor Section */}
          <Card glowOnHover>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#63f5e8", marginBottom: "1rem" }}>
              <FileText size={18} />
              <h3 style={{ margin: 0, color: "#63f5e8" }}>Resolution & Client Response Notes</h3>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0 0 1rem 0" }}>
              Provide detailed resolution notes, technical findings, or response guidance. These notes are visible to the client upon status updates.
            </p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={6}
              placeholder="Enter resolution notes, root cause analysis, or response details for the client..."
              style={{
                width: "100%",
                backgroundColor: "#0c1222",
                border: "1px solid #1e293b",
                borderRadius: "6px",
                padding: "0.85rem",
                color: "#e2e8f0",
                fontSize: "0.9rem",
                fontFamily: "inherit",
                lineHeight: 1.6,
                outline: "none",
                resize: "vertical",
                marginBottom: "1.25rem",
              }}
            />

            <Button glow size="sm" onClick={handleSave} disabled={updateTicket.isLoading}>
              <Save size={14} />
              {updateTicket.isLoading ? "Saving Changes..." : "Save Ticket & Resolution"}
            </Button>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default TicketDetails;
