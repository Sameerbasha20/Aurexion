export type TicketCategory = "bug" | "enhancement" | "security" | "infrastructure" | "incident" | "general";
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

export interface ProjectMilestone {
  id: number;
  project: number;
  project_title: string;
  name: string;
  description: string;
  status: "upcoming" | "in_progress" | "completed" | "delayed";
  status_display: string;
  planned_date: string | null;
  completion_date: string | null;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface SprintDeliverable {
  id: number;
  project: number;
  project_title: string;
  sprint_name: string;
  sprint_period: string;
  deliverable_name: string;
  delivery_status: "completed" | "in_progress" | "pending";
  delivery_status_display: string;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientProjectItem {
  id: number;
  title: string;
  description: string;
  status: "planning" | "in_progress" | "under_review" | "completed" | "on_hold";
  status_display: string;
  progress_percentage: number;
  delivery_lead_name: string;
  start_date: string | null;
  target_completion_date: string | null;
  milestones: ProjectMilestone[];
  deliverables: SprintDeliverable[];
  current_milestone: ProjectMilestone | null;
  next_milestone: ProjectMilestone | null;
  created_at: string;
  updated_at: string;
}

export interface ClientDocumentItem {
  id: number;
  project: number | null;
  project_title: string | null;
  title: string;
  document_type: "requirements" | "architecture" | "sow" | "report" | "contract" | "invoice" | "deliverable" | "specification" | "other";
  document_type_display: string;
  file_url: string;
  file_size: string;
  download_url: string;
  uploaded_at: string;
}

export interface ClientRequestItem {
  id: number;
  project: number | null;
  project_title: string | null;
  title: string;
  category: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "submitted" | "under_review" | "approved" | "in_progress" | "completed" | "rejected";
  status_display: string;
  created_at: string;
  updated_at: string;
}

export interface ConsultationRequestItem {
  id: number;
  project: number | null;
  project_title: string | null;
  request_type: "technical_review" | "status_call";
  request_type_display: string;
  title: string;
  description: string;
  preferred_date: string | null;
  scheduled_at: string | null;
  meeting_link: string;
  status: "requested" | "under_review" | "scheduled" | "completed" | "cancelled";
  status_display: string;
  created_at: string;
  updated_at: string;
}

export interface ClientNotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: "ticket_update" | "project_update" | "milestone_update" | "document_available" | "consultation_update";
  notification_type_display: string;
  is_read: boolean;
  link: string;
  created_at: string;
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
  project?: number | null;
  project_title?: string | null;
  created_at: string;
  updated_at: string;
  resolution_notes?: string;
}

export interface SupportTicketDetail {
  id: number;
  ticket_id: string;
  client_user: string;
  client_user_id: number;
  assigned_to: string | null;
  assigned_to_id: number | null;
  project?: number | null;
  project_title?: string | null;
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
  project?: number | null;
}

export interface SupportTicketUpdateInput {
  subject?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  project?: number | null;
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

export type TicketStats = DashboardTicketStats;

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