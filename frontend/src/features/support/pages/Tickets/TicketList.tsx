import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import { Search, Filter, RefreshCw, LifeBuoy } from "lucide-react";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Label } from "../../../../components/ui/label";
import { EmptyState, ErrorState, LoadingState } from "../../../portal/components/StateViews";
import { TicketCategoryBadge, TicketPriorityBadge, TicketStatusBadge } from "../../../portal/components/TicketMeta";
import { formatDateTime } from "../../../portal/utils/format";
import type { ExecutiveTicketUpdateInput, TicketCategory, TicketPriority, TicketStatus } from "../../../portal/types/portal.types";
import useExecutiveTickets from "../../hooks/useExecutiveTickets";
import useUpdateExecutiveTicket from "../../hooks/useUpdateExecutiveTicket";

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
  const tickets = useExecutiveTickets();
  const updateTicket = useUpdateExecutiveTicket();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedTickets = filtered.slice(startIndex, startIndex + pageSize);

  const handleQuickStatus = async (id: number, nextStatus: TicketStatus) => {
    try {
      const ticket = tickets.data?.find((t) => t.id === id);
      if (nextStatus === "closed" && (!ticket?.resolution_notes || !ticket.resolution_notes.trim())) {
        alert("Cannot close ticket: Resolution notes are required before closing this ticket. Please open ticket details to enter resolution notes.");
        return;
      }
      await updateTicket.update(id, { status: nextStatus });
      await tickets.refetch();
    } catch (err) {
      console.error("Failed to update ticket status:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow" style={{ color: "#63f5e8", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <LifeBuoy size={14} /> SUPPORT DESK
          </p>
          <h1 style={{ fontSize: "2rem", margin: "0.25rem 0 0 0", fontFamily: "var(--font-display)", fontWeight: 600 }}>
            Assigned Tickets Queue
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
            Manage, update status, and resolve tickets assigned to your executive account.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => tickets.refetch()}>
          <RefreshCw size={14} /> Refresh Queue
        </Button>
      </div>

      {tickets.isLoading ? (
        <LoadingState rows={5} label="Loading tickets queue..." />
      ) : tickets.isError ? (
        <ErrorState error={tickets.error} onRetry={tickets.refetch} title="Unable to load assigned tickets" />
      ) : (
        <>
          {/* Filters Bar */}
          <Card glowOnHover>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "#63f5e8", fontSize: "0.85rem", fontWeight: 600 }}>
              <Filter size={16} /> Filter & Search Ticket Ledger
            </div>
            <div
              style={{
                display: "grid",
                gap: "1rem",
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    placeholder="Subject, ID, or client"
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
          </Card>

          {/* Tickets Table */}
          <Card glowOnHover>
            {filtered.length === 0 ? (
              <EmptyState
                title="No matching tickets"
                description="No assigned tickets match the search query or active filter settings."
              />
            ) : (
              <>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: "#64748b", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.7rem", letterSpacing: "0.08em" }}>
                        <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>TICKET ID</th>
                        <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)", width: "25%" }}>SUBJECT</th>
                        <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>CLIENT</th>
                        <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>ASSIGNED</th>
                        <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>CATEGORY</th>
                        <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>PRIORITY</th>
                        <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>STATUS</th>
                        <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)" }}>UPDATED</th>
                        <th style={{ padding: "0.75rem", borderBottom: "1px solid rgba(140,174,187,0.2)", textAlign: "right" }}>QUICK STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTickets.map((ticket) => (
                        <tr key={ticket.id} style={{ borderBottom: "1px solid rgba(140,174,187,0.12)" }}>
                          <td style={{ padding: "0.75rem", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", color: "#63f5e8" }}>
                            <Link href={`/support/tickets/${ticket.id}`} style={{ color: "#63f5e8" }}>
                              {ticket.ticket_id}
                            </Link>
                          </td>
                          <td style={{ padding: "0.75rem" }}>
                            <Link href={`/support/tickets/${ticket.id}`} style={{ color: "#e2e8f0", textDecoration: "none" }}>
                              <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600 }}>
                                {ticket.subject}
                              </span>
                            </Link>
                          </td>
                          <td style={{ padding: "0.75rem", color: "#cbd5e1" }}>{ticket.client_username}</td>
                          <td style={{ padding: "0.75rem", color: "#cbd5e1", fontSize: "0.8rem" }}>
                            {ticket.assigned_username || "Unassigned"}
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
                          <td style={{ padding: "0.75rem", textAlign: "right" }}>
                            <select
                              value={ticket.status}
                              onChange={(e) => handleQuickStatus(ticket.id, e.target.value as TicketStatus)}
                              style={{
                                backgroundColor: "#0c1222",
                                border: "1px solid #1e293b",
                                color: "#63f5e8",
                                fontSize: "0.75rem",
                                fontFamily: "IBM Plex Mono, monospace",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "4px",
                                outline: "none",
                                cursor: "pointer",
                              }}
                            >
                              <option value="open">Open</option>
                              <option value="assigned">Assigned</option>
                              <option value="in_progress">In Progress</option>
                              <option value="awaiting_client">Awaiting Client</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Standardized Pagination Controls */}
                <div
                  style={{
                    padding: "1rem 1.5rem",
                    borderTop: "1px solid rgba(140, 174, 187, 0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    color: "#94a3b8",
                  }}
                >
                  <div>
                    Showing <strong style={{ color: "#f8fafc" }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> to{" "}
                    <strong style={{ color: "#f8fafc" }}>{endIndex}</strong> of{" "}
                    <strong style={{ color: "#f8fafc" }}>{totalItems}</strong> entries
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span>Rows per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        style={{
                          padding: "0.25rem 0.5rem",
                          backgroundColor: "#050811",
                          border: "1px solid rgba(140, 174, 187, 0.25)",
                          color: "#f8fafc",
                          borderRadius: "4px",
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <Button
                        variant="outline"
                        disabled={currentPage === 1 || tickets.isLoading}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                      >
                        Previous
                      </Button>
                      <span style={{ display: "flex", alignItems: "center", padding: "0 0.5rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8" }}>
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={currentPage >= totalPages || tickets.isLoading}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default TicketList;
