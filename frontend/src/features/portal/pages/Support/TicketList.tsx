import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { Plus, Search } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";
import PageHeader from "../../components/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "../../components/StateViews";
import { TicketCategoryBadge, TicketPriorityBadge, TicketStatusBadge } from "../../components/TicketMeta";
import { formatDateTime } from "../../utils/format";
import type { TicketCategory, TicketPriority, TicketStatus } from "../../types/portal.types";
import useMyTickets from "../../hooks/useMyTickets";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_client", label: "Awaiting Client" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const CATEGORY_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "bug", label: "Bug" },
  { value: "enhancement", label: "Enhancement" },
  { value: "security", label: "Security" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "general", label: "General" },
];

const PRIORITY_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const TicketList: React.FC = () => {
  const tickets = useMyTickets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (!tickets.data) return [];
    const term = search.trim().toLowerCase();
    return tickets.data.filter((ticket) => {
      if (statusFilter !== "all" && ticket.status !== (statusFilter as TicketStatus)) return false;
      if (categoryFilter !== "all" && ticket.category !== (categoryFilter as TicketCategory)) return false;
      if (priorityFilter !== "all" && ticket.priority !== (priorityFilter as TicketPriority)) return false;
      if (term) {
        const haystack = `${ticket.subject} ${ticket.ticket_id} ${ticket.client_username}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [tickets.data, search, statusFilter, categoryFilter, priorityFilter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="CLIENT SUPPORT"
        title="My Tickets"
        description="All support tickets submitted from your client account."
        actions={
          <Link href="/portal/support/tickets/create">
            <Button glow size="sm">
              <Plus size={14} />
              Create Ticket
            </Button>
          </Link>
        }
      />

      {tickets.isLoading ? (
        <LoadingState rows={5} label="Loading tickets" />
      ) : tickets.isError ? (
        <ErrorState error={tickets.error} onRetry={tickets.refetch} title="Unable to load tickets" />
      ) : tickets.data && tickets.data.length === 0 ? (
        <EmptyState
          title="No support tickets"
          description="You have not submitted any support tickets yet."
          action={
            <Link href="/portal/support/tickets/create">
              <Button glow size="sm">
                <Plus size={14} />
                Create your first ticket
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              alignItems: "end",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label htmlFor="ticket-search" style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>
                SEARCH
              </Label>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <Input
                  id="ticket-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Subject or ticket ID"
                  style={{ paddingLeft: "2.25rem" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>STATUS</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger style={{ width: "100%" }}>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>CATEGORY</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger style={{ width: "100%" }}>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_FILTERS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <Label style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b" }}>PRIORITY</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger style={{ width: "100%" }}>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_FILTERS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No matching tickets"
              description="No tickets match the current search and filters."
            />
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "760px",
                  fontSize: "0.875rem",
                }}
              >
                <thead>
                  <tr style={{ textAlign: "left", color: "#64748b", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>TICKET</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>SUBJECT</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>CATEGORY</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>PRIORITY</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>STATUS</th>
                    <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>UPDATED</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ticket) => (
                    <tr key={ticket.id} style={{ borderBottom: "1px solid rgba(140,174,187,0.12)" }}>
                      <td style={{ padding: "0.75rem", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", color: "#63f5e8" }}>
                        <Link href={`/portal/support/tickets/${ticket.id}`} style={{ color: "#63f5e8" }}>
                          {ticket.ticket_id}
                        </Link>
                      </td>
                      <td style={{ padding: "0.75rem", maxWidth: "320px" }}>
                        <Link href={`/portal/support/tickets/${ticket.id}`} style={{ color: "#e2e8f0", textDecoration: "none" }}>
                          <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {ticket.subject}
                          </span>
                        </Link>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <TicketCategoryBadge category={ticket.category} />
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <TicketPriorityBadge priority={ticket.priority} />
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <TicketStatusBadge status={ticket.status} />
                      </td>
                      <td style={{ padding: "0.75rem", color: "#94a3b8", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {formatDateTime(ticket.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TicketList;