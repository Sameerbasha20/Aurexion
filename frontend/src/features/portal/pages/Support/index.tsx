import React from "react";
import { Link } from "wouter";
import { LifeBuoy, Plus, ListChecks } from "lucide-react";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import PageHeader from "../../components/PageHeader";
import { ErrorState, LoadingState, EmptyState } from "../../components/StateViews";
import { buildTicketStats } from "../../types/portal.types";
import useMyTickets from "../../hooks/useMyTickets";

export const SupportHome: React.FC = () => {
  const tickets = useMyTickets();
  const stats = tickets.data ? buildTicketStats(tickets.data) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="CLIENT SUPPORT"
        title="Support Center"
        description="Submit support tickets and track their resolution status in real time."
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
        <LoadingState rows={3} label="Loading support tickets" />
      ) : tickets.isError ? (
        <ErrorState error={tickets.error} onRetry={tickets.refetch} title="Unable to load support tickets" />
      ) : stats ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1.25rem",
            }}
          >
            <Card
              glowOnHover
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Total Tickets
                </span>
                <div style={{ color: "#63f5e8", backgroundColor: "rgba(99, 245, 232, 0.06)", padding: "6px", borderRadius: "6px", display: "flex" }}>
                  <LifeBuoy size={16} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "2rem", fontWeight: 600, color: "#f8fafc", fontFamily: "Space Grotesk, sans-serif", lineHeight: 1.1 }}>
                  {stats.total}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.35rem" }}>
                  All your submitted tickets
                </div>
              </div>
            </Card>

            <Card
              glowOnHover
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Active
                </span>
                <div style={{ color: "#fbbf24", backgroundColor: "rgba(251, 191, 36, 0.06)", padding: "6px", borderRadius: "6px", display: "flex" }}>
                  <ListChecks size={16} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "2rem", fontWeight: 600, color: "#f8fafc", fontFamily: "Space Grotesk, sans-serif", lineHeight: 1.1 }}>
                  {stats.open + stats.inProgress + stats.awaitingClient}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.35rem" }}>
                  Open / in progress / awaiting
                </div>
              </div>
            </Card>

            <Card
              glowOnHover
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Resolved
                </span>
                <div style={{ color: "#4ade80", backgroundColor: "rgba(74, 222, 128, 0.06)", padding: "6px", borderRadius: "6px", display: "flex" }}>
                  <ListChecks size={16} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "2rem", fontWeight: 600, color: "#f8fafc", fontFamily: "Space Grotesk, sans-serif", lineHeight: 1.1 }}>
                  {stats.resolved}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.35rem" }}>
                  Resolution delivered
                </div>
              </div>
            </Card>

            <Card
              glowOnHover
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Closed
                </span>
                <div style={{ color: "#64748b", backgroundColor: "rgba(100, 116, 139, 0.06)", padding: "6px", borderRadius: "6px", display: "flex" }}>
                  <ListChecks size={16} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: "2rem", fontWeight: 600, color: "#f8fafc", fontFamily: "Space Grotesk, sans-serif", lineHeight: 1.1 }}>
                  {stats.closed}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "0.35rem" }}>
                  Closed tickets
                </div>
              </div>
            </Card>
          </div>

          {tickets.data && tickets.data.length === 0 ? (
            <EmptyState
              title="No support tickets"
              description="When you create a support ticket, it will be listed here with its live status."
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
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, color: "#63f5e8" }}>Ticket Queue</h3>
                <Link href="/portal/support/tickets">
                  <Button variant="outline" size="sm">
                    <ListChecks size={14} />
                    View all tickets
                  </Button>
                </Link>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                <LifeBuoy size={16} />
                <span>Support requests are processed by the Aurexion support team. Status updates appear in the ticket detail view.</span>
              </div>
            </Card>
          )}
        </>
      ) : null}
    </div>
  );
};

export default SupportHome;