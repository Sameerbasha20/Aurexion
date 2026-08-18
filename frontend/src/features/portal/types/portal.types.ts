export type TicketCategory = "bug" | "enhancement" | "security" | "infrastructure" | "general";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketStatus = "open" | "assigned" | "in_progress" | "awaiting_client" | "resolved" | "closed";

export interface PortalProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  date_joined: string;
}

export interface SupportTicketItem {
  id: number;
  ticket_id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  client_username: string;
  assigned_username: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketDetail {
  id: number;
  ticket_id: string;
  client_user: string;
  client_user_id: number;
  assigned_to: string | null;
  assigned_to_id: number | null;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  resolution_notes: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface SupportTicketCreateInput {
  subject: string;
  category?: TicketCategory;
  priority?: TicketPriority;
}

export interface SupportTicketUpdateInput {
  subject?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  resolution_notes?: string;
}

export interface ExecutiveTicketUpdateInput {
  subject?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  assigned_to?: number | null;
  resolution_notes?: string;
}

export interface AdminTicketUpdateInput {
  subject?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  assigned_to?: number | null;
  client_user?: number;
  resolution_notes?: string;
}

export interface AssignableUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface DashboardTicketStats {
  total: number;
  open: number;
  assigned: number;
  inProgress: number;
  awaitingClient: number;
  resolved: number;
  closed: number;
  critical: number;
}

export function buildTicketStats(tickets: SupportTicketItem[]): DashboardTicketStats {
  return {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    assigned: tickets.filter((t) => t.status === "assigned").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    awaitingClient: tickets.filter((t) => t.status === "awaiting_client").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    critical: tickets.filter((t) => t.priority === "critical").length,
  };
}