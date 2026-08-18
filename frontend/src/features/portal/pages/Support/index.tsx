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
          <div style={{ display: "grid", gap: "1.5rem" }} className="grid-responsive">
            <Card glowOnHover>
              <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>Total Tickets</h3>
              <p style={{ fontSize: "2.25rem", fontWeight: 600, color: "#63f5e8", margin: "0.5rem 0 0 0" }}>{stats.total}</p>
              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>All your submitted tickets</span>
            </Card>
            <Card glowOnHover>
              <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>Active</h3>
              <p style={{ fontSize: "2.25rem", fontWeight: 600, color: "#fbbf24", margin: "0.5rem 0 0 0" }}>
                {stats.open + stats.inProgress + stats.awaitingClient}
              </p>
              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Open / in progress / awaiting client</span>
            </Card>
            <Card glowOnHover>
              <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>Resolved</h3>
              <p style={{ fontSize: "2.25rem", fontWeight: 600, color: "#4ade80", margin: "0.5rem 0 0 0" }}>{stats.resolved}</p>
              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Resolution delivered</span>
            </Card>
            <Card glowOnHover>
              <h3 style={{ margin: 0, fontSize: "0.9rem", color: "#94a3b8" }}>Closed</h3>
              <p style={{ fontSize: "2.25rem", fontWeight: 600, color: "#64748b", margin: "0.5rem 0 0 0" }}>{stats.closed}</p>
              <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Closed tickets</span>
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