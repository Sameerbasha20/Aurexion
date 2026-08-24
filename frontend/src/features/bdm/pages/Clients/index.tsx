import React, { useState, useMemo } from "react";
import { useBdmDashboard } from "../../hooks/useBdmDashboard";
import crmService from "../../../crm/services/crmService";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import Button from "../../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../../../components/ui/dropdown-menu";
import {
  CheckCircle2,
  Mail,
  Phone,
  User,
  DollarSign,
  Eye,
  ArrowUpRight,
  Calendar,
  Building,
  Briefcase,
  FileText,
  ShieldCheck,
  Key,
  Send,
  AlertTriangle,
  Clock,
  MoreVertical,
  Filter,
  Copy,
  Check,
  Globe,
  ShieldAlert,
  Search,
} from "lucide-react";

export const Clients: React.FC = () => {
  const { data, isLoading, error, refetch } = useBdmDashboard();
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [passwordInput, setPasswordInput] = useState("client@2026");
  const [emailInput, setEmailInput] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [salesExecFilter, setSalesExecFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Sync emailInput when selectedClient changes
  React.useEffect(() => {
    if (selectedClient) {
      setEmailInput(selectedClient.email || "");
    }
  }, [selectedClient]);

  const showFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleDispatchCredentials = async (clientId: number, clientName: string, overrideEmail?: string) => {
    const targetEmail = (overrideEmail || emailInput || "").trim();
    if (!targetEmail) {
      showFeedback("error", "Client email address is required to dispatch credentials and create portal account.");
      return;
    }

    setIsDispatching(true);
    const pwd = passwordInput.trim() || "client@2026";
    try {
      await crmService.onboardClient(clientId, pwd, targetEmail);
      showFeedback("success", `Client ${clientName} onboarded! Credentials email (Username: ${targetEmail}, Password: ${pwd}) dispatched successfully.`);
      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient({
          ...selectedClient,
          email: targetEmail,
          client_onboarded: true,
        });
      }
      refetch();
    } catch (err: any) {
      const detailMsg = err?.response?.data?.detail || err?.message || "Failed to onboard client and dispatch credentials.";
      showFeedback("error", detailMsg);
    } finally {
      setIsDispatching(false);
    }
  };

  const clients = data?.won_clients || [];

  // Extract unique sales executives for the dropdown filter
  const salesExecutives = useMemo(() => {
    const execs = new Set<string>();
    clients.forEach((c) => {
      if (c.assigned_to_name && c.assigned_to_name !== "Unassigned") {
        execs.add(c.assigned_to_name);
      }
    });
    return Array.from(execs);
  }, [clients]);

  // Filtered clients list based on status, sales rep, and search query
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Status filter
      if (statusFilter === "pending" && client.client_onboarded) return false;
      if (statusFilter === "active" && !client.client_onboarded) return false;

      // Sales Executive filter
      if (salesExecFilter !== "all" && client.assigned_to_name !== salesExecFilter) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (client.name || "").toLowerCase();
        const company = (client.company || "").toLowerCase();
        const email = (client.email || "").toLowerCase();
        const refId = (client.reference_id || "").toLowerCase();
        const phone = (client.phone || "").toLowerCase();
        if (!name.includes(q) && !company.includes(q) && !email.includes(q) && !refId.includes(q) && !phone.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [clients, statusFilter, salesExecFilter, searchQuery]);

  const totalItems = filteredClients.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedClients = useMemo(() => {
    return filteredClients.slice(startIndex, startIndex + pageSize);
  }, [filteredClients, startIndex, pageSize]);

  const pendingOnboardings = clients.filter((c) => !c.client_onboarded);
  const activeClients = clients.filter((c) => c.client_onboarded);
  const totalRevenue = clients.reduce((sum, c) => sum + (c.value || 0), 0);

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div>
          <p className="eyebrow">BUSINESS DEVELOPMENT</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>Clients</h1>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <p style={{ color: "#94a3b8" }}>Loading client directory…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div>
          <p className="eyebrow">BUSINESS DEVELOPMENT</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>Clients</h1>
        </div>
        <Card borderAccent>
          <CardContent className="text-center py-8">
            <p style={{ color: "#ef4444" }}>Failed to load clients: {error}</p>
            <button type="button" onClick={refetch} className="mt-4 px-4 py-2 bg-[#63f5e8] text-[#050811] rounded font-medium">
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="eyebrow">BUSINESS DEVELOPMENT</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>Clients</h1>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
            Won leads converted into active enterprise clients by Sales Executives and onboarded by BDM.
          </p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="px-4 py-2 bg-transparent border border-[#63f5e8] text-[#63f5e8] rounded font-medium hover:bg-[#63f5e8] hover:text-[#050811] transition-colors cursor-pointer"
        >
          Refresh Data
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "4px",
            fontSize: "0.85rem",
            fontFamily: "IBM Plex Mono, monospace",
            backgroundColor: feedback.type === "success" ? "rgba(74, 222, 128, 0.15)" : "rgba(239, 68, 68, 0.15)",
            color: feedback.type === "success" ? "#4ade80" : "#ef4444",
            border: feedback.type === "success" ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {feedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {feedback.text}
        </div>
      )}

      {/* Pending Client Onboarding Alert Banner */}
      {pendingOnboardings.length > 0 && (
        <div
          style={{
            padding: "1rem 1.25rem",
            backgroundColor: "rgba(251, 191, 36, 0.08)",
            border: "1px solid rgba(251, 191, 36, 0.25)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(251, 191, 36, 0.2)", display: "grid", placeItems: "center", color: "#fbbf24" }}>
              <Clock size={18} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#f8fafc" }}>
                {pendingOnboardings.length} Won {pendingOnboardings.length === 1 ? "Lead" : "Leads"} Ready for BDM Client Conversion
              </h4>
              <p style={{ margin: "0.15rem 0 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
                Sales Executive has closed the deal. Review the project cost and dispatch portal credentials to the client.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            style={{
              padding: "0.4rem 0.85rem",
              fontSize: "0.8rem",
              fontFamily: "IBM Plex Mono, monospace",
              backgroundColor: "rgba(251, 191, 36, 0.2)",
              color: "#fbbf24",
              border: "1px solid rgba(251, 191, 36, 0.4)",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Filter Pending ({pendingOnboardings.length})
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))" }}>
        <Card glowOnHover>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Won Clients</CardTitle>
            <User size={16} style={{ color: "#63f5e8" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#63f5e8" }}>{clients.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeClients.length} active, {pendingOnboardings.length} pending onboarding
            </p>
          </CardContent>
        </Card>

        <Card glowOnHover>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Won Revenue</CardTitle>
            <DollarSign size={16} style={{ color: "#22c55e" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#22c55e" }}>
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cumulative closed deal value</p>
          </CardContent>
        </Card>

        <Card glowOnHover>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Deal Size</CardTitle>
            <DollarSign size={16} style={{ color: "#a78bfa" }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ color: "#a78bfa" }}>
              ${clients.length > 0 ? (totalRevenue / clients.length).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per client average</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Directory Table with Filter Dropdowns */}
      <Card borderAccent>
        <CardHeader>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p className="eyebrow" style={{ margin: 0, color: "#22c55e" }}>CLIENT DIRECTORY</p>
              <CardTitle className="text-xl mt-1" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={20} style={{ color: "#22c55e" }} /> Converted Enterprise Clients
              </CardTitle>
            </div>

            {/* Filter Dropdowns & Search Bar */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              {/* Search input */}
              <div style={{ position: "relative", minWidth: "180px" }}>
                <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "0.45rem 0.75rem 0.45rem 2.1rem",
                    backgroundColor: "#050811",
                    border: "1px solid #1e293b",
                    borderRadius: "4px",
                    color: "#f8fafc",
                    fontSize: "0.82rem",
                    outline: "none",
                    width: "100%",
                  }}
                />
              </div>

              {/* Status Filter Dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Filter size={14} style={{ color: "#63f5e8" }} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: "0.45rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(99, 245, 232, 0.3)",
                    borderRadius: "4px",
                    color: "#f8fafc",
                    fontSize: "0.82rem",
                    fontFamily: "IBM Plex Mono, monospace",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">Status: All Clients ({clients.length})</option>
                  <option value="pending">Status: Pending Onboarding ({pendingOnboardings.length})</option>
                  <option value="active">Status: Active Clients ({activeClients.length})</option>
                </select>
              </div>

              {/* Sales Executive Filter Dropdown */}
              {salesExecutives.length > 0 && (
                <select
                  value={salesExecFilter}
                  onChange={(e) => setSalesExecFilter(e.target.value)}
                  style={{
                    padding: "0.45rem 0.75rem",
                    backgroundColor: "#050811",
                    border: "1px solid rgba(140, 174, 187, 0.3)",
                    borderRadius: "4px",
                    color: "#f8fafc",
                    fontSize: "0.82rem",
                    fontFamily: "IBM Plex Mono, monospace",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="all">Rep: All Sales Execs</option>
                  {salesExecutives.map((exec) => (
                    <option key={exec} value={exec}>
                      Rep: {exec}
                    </option>
                  ))}
                </select>
              )}

              {/* Reset filter button if any active */}
              {/* {(statusFilter !== "all" || salesExecFilter !== "all" || searchQuery !== "") && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setSalesExecFilter("all");
                    setSearchQuery("");
                  }}
                  style={{
                    padding: "0.45rem 0.65rem",
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    background: "transparent",
                    border: "1px solid #334155",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>
              )} */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredClients.length > 0 ? (
            <>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.2)", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      <th style={{ padding: "0.75rem 1rem", minWidth: "160px" }}>CLIENT NAME</th>
                      <th style={{ padding: "0.75rem 1rem", minWidth: "140px" }}>COMPANY</th>
                      <th style={{ padding: "0.75rem 1rem", minWidth: "180px" }}>EMAIL</th>
                      <th style={{ padding: "0.75rem 1rem", minWidth: "130px" }}>PROJECT COST ($)</th>
                      <th style={{ padding: "0.75rem 1rem", minWidth: "150px" }}>SALES EXECUTIVE</th>
                      <th style={{ padding: "0.75rem 1rem", minWidth: "190px" }}>PORTAL STATUS</th>
                      <th style={{ padding: "0.75rem 1rem", minWidth: "150px", textAlign: "right" }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedClients.map((client) => (
                      <tr
                        key={client.id}
                        style={{ borderBottom: "1px solid rgba(140, 174, 187, 0.1)", cursor: "pointer" }}
                        className="hover:bg-slate-800/30 transition-colors"
                        onClick={() => {
                          setSelectedClient(client);
                          setPasswordInput("client@2026");
                        }}
                      >
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#f8fafc" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: client.client_onboarded ? "rgba(34, 197, 94, 0.15)" : "rgba(251, 191, 36, 0.15)",
                              display: "grid",
                              placeItems: "center",
                              color: client.client_onboarded ? "#22c55e" : "#fbbf24",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}>
                              {client.name?.charAt(0)?.toUpperCase() || "C"}
                            </div>
                            {client.name}
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#cbd5e1" }}>
                          {client.company || "Individual Client"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <a
                            href={`mailto:${client.email}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: "#63f5e8", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.82rem" }}
                          >
                            <Mail size={13} /> {client.email}
                          </a>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#22c55e", fontSize: "0.95rem" }}>
                          ${client.value ? client.value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#38bdf8", fontWeight: 500 }}>
                          {client.assigned_to_name || "Unassigned"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          {client.client_onboarded ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              Active Client (Creds Sent)
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                              Pending Credential Dispatch
                            </Badge>
                          )}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", whiteSpace: "nowrap", minWidth: "150px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem", flexWrap: "nowrap" }} onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedClient(client);
                                setPasswordInput("client@2026");
                              }}
                              style={{ fontSize: "0.75rem", padding: "0.35rem 0.65rem", color: "#63f5e8", borderColor: "rgba(99, 245, 232, 0.3)", whiteSpace: "nowrap" }}
                            >
                              <Eye size={13} style={{ marginRight: "0.3rem" }} /> View Detail
                            </Button>

                            {/* Row Dropdown Action Menu */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  style={{
                                    background: "none",
                                    border: "1px solid rgba(140, 174, 187, 0.2)",
                                    borderRadius: "4px",
                                    padding: "0.35rem 0.45rem",
                                    color: "#94a3b8",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <MoreVertical size={14} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" style={{ backgroundColor: "#0c1222", border: "1px solid #1e293b", color: "#f8fafc" }}>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setPasswordInput("client@2026");
                                  }}
                                  style={{ cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                                >
                                  <Eye size={14} /> View Account Detail
                                </DropdownMenuItem>

                                {!client.client_onboarded && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedClient(client);
                                      setPasswordInput("client@2026");
                                    }}
                                    style={{ cursor: "pointer", fontSize: "0.8rem", color: "#22c55e", display: "flex", alignItems: "center", gap: "0.5rem" }}
                                  >
                                    <Key size={14} /> Send Portal Credentials
                                  </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator style={{ backgroundColor: "#1e293b" }} />

                                <DropdownMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(client.email);
                                    showFeedback("success", `Copied email ${client.email} to clipboard!`);
                                  }}
                                  style={{ cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                                >
                                  <Copy size={14} /> Copy Email Address
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(client.reference_id || `#CL-${client.id}`);
                                    showFeedback("success", `Copied Reference ID ${client.reference_id} to clipboard!`);
                                  }}
                                  style={{ cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                                >
                                  <Copy size={14} /> Copy Reference ID
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
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
                      disabled={currentPage === 1 || isLoading}
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
                      disabled={currentPage >= totalPages || isLoading}
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <CheckCircle2 size={48} style={{ color: "#334155", margin: "0 auto 1rem" }} />
              <p style={{ color: "#64748b", fontSize: "1rem", margin: 0 }}>
                {clients.length === 0 ? "No clients converted yet" : "No clients match the selected filter criteria"}
              </p>
              <p style={{ color: "#475569", fontSize: "0.85rem", margin: "0.5rem 0 0 0" }}>
                {clients.length === 0
                  ? "When a Sales Executive marks a lead as WON, it will appear here ready for BDM credential dispatch."
                  : "Try clearing or changing your search query or dropdown filter."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Detail View Modal */}
      {selectedClient && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(5, 8, 17, 0.85)",
          backdropFilter: "blur(8px)",
          display: "grid",
          placeItems: "center",
          zIndex: 1000,
          padding: "clamp(0.5rem, 2vw, 1.5rem)",
        }}>
          <Card borderAccent style={{ width: "100%", maxWidth: "680px", maxHeight: "90vh", overflowY: "auto", padding: "clamp(1rem, 3vw, 2rem)", backgroundColor: "#0a111c" }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div>
                <span style={{ fontSize: "0.72rem", fontFamily: "IBM Plex Mono, monospace", color: selectedClient.client_onboarded ? "#22c55e" : "#fbbf24", fontWeight: 600 }}>
                  {selectedClient.client_onboarded ? "ACTIVE ENTERPRISE CLIENT" : "WON LEAD AWAITING BDM ONBOARDING"}
                </span>
                <h2 style={{ fontSize: "1.6rem", color: "#f8fafc", margin: "0.25rem 0 0 0", fontWeight: 700 }}>
                  {selectedClient.company || selectedClient.name}
                </h2>
                <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>
                  Primary Contact: <strong style={{ color: "#f8fafc" }}>{selectedClient.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                style={{ background: "none", border: 0, color: "#94a3b8", cursor: "pointer", fontSize: "1.5rem", padding: "0.25rem" }}
              >
                ✕
              </button>
            </div>

            {/* Badges & Status Banner */}
            <div style={{
              backgroundColor: selectedClient.client_onboarded ? "rgba(34, 197, 94, 0.08)" : "rgba(251, 191, 36, 0.08)",
              border: `1px solid ${selectedClient.client_onboarded ? "rgba(34, 197, 94, 0.3)" : "rgba(251, 191, 36, 0.3)"}`,
              padding: "1.25rem",
              borderRadius: "6px",
              marginBottom: "1.5rem",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", fontWeight: 600 }}>
                    REF: {selectedClient.reference_id || `#CL-${selectedClient.id}`}
                  </span>
                  <Badge className={selectedClient.client_onboarded ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
                    {selectedClient.client_onboarded ? "WON DEAL / ONBOARDED" : "WON DEAL / PENDING DISPATCH"}
                  </Badge>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: selectedClient.client_onboarded ? "#22c55e" : "#fbbf24", fontSize: "0.8rem", fontWeight: 600 }}>
                  {selectedClient.client_onboarded ? (
                    <>
                      <ShieldCheck size={16} /> Portal Account Active
                    </>
                  ) : (
                    <>
                      <Clock size={16} /> Credentials Not Sent Yet
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginTop: "0.5rem" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace" }}>PROJECT / DEAL COST</span>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "1.4rem", fontWeight: 700, color: "#22c55e" }}>
                    ${selectedClient.value ? selectedClient.value.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontFamily: "IBM Plex Mono, monospace" }}>CLOSED BY (SALES EXEC)</span>
                  <p style={{ margin: "0.2rem 0 0 0", fontSize: "1.1rem", fontWeight: 600, color: "#38bdf8" }}>
                    {selectedClient.assigned_to_name || "Unassigned"}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive BDM Credential Dispatch Box (when pending) */}
            {!selectedClient.client_onboarded && (
              <div style={{
                backgroundColor: "rgba(99, 245, 232, 0.05)",
                border: "1px solid rgba(99, 245, 232, 0.3)",
                padding: "1.25rem",
                borderRadius: "6px",
                marginBottom: "1.5rem",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", color: "#63f5e8", fontWeight: 600, fontSize: "0.9rem" }}>
                  <Key size={16} /> BDM Client Onboarding & Welcome Credential Dispatch
                </div>
                <p style={{ fontSize: "0.8rem", color: "#cbd5e1", margin: "0 0 1rem 0", lineHeight: 1.5 }}>
                  Clicking below will create the client's portal user account and dispatch an automated welcome email containing their login credentials.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#63f5e8", marginBottom: "0.35rem", fontWeight: 600 }}>
                      CLIENT LOGIN EMAIL ADDRESS (REQUIRED)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. client@company.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        backgroundColor: "#050811",
                        border: "1px solid rgba(99, 245, 232, 0.4)",
                        borderRadius: "4px",
                        color: "#f8fafc",
                        fontSize: "0.85rem",
                        fontFamily: "IBM Plex Mono, monospace",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <label style={{ display: "block", fontSize: "0.75rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", marginBottom: "0.35rem" }}>
                        CLIENT PORTAL DEFAULT PASSWORD
                      </label>
                      <input
                        type="text"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.55rem 0.75rem",
                          backgroundColor: "#050811",
                          border: "1px solid rgba(99, 245, 232, 0.3)",
                          borderRadius: "4px",
                          color: "#f8fafc",
                          fontSize: "0.85rem",
                          fontFamily: "IBM Plex Mono, monospace",
                        }}
                      />
                    </div>
                    <Button
                      glow
                      disabled={isDispatching || !emailInput.trim()}
                      onClick={() => handleDispatchCredentials(selectedClient.id, selectedClient.name, emailInput)}
                      style={{ backgroundColor: "#22c55e", color: "#ffffff", padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}
                    >
                      <Send size={14} style={{ marginRight: "0.4rem" }} />
                      {isDispatching ? "Dispatching Email..." : "Send Credentials & Onboard Client"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Contact & Company Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.6)", border: "1px solid rgba(140, 174, 187, 0.15)", padding: "1rem", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Mail size={12} /> CONTACT EMAIL
                </span>
                <a href={`mailto:${selectedClient.email}`} style={{ display: "block", marginTop: "0.4rem", color: "#63f5e8", fontWeight: 500, textDecoration: "none", fontSize: "0.95rem" }}>
                  {selectedClient.email}
                </a>
                {(selectedClient.rfp_enquiry_details?.designation || selectedClient.designation) && (
                  <span style={{ fontSize: "0.78rem", color: "#63f5e8", marginTop: "0.35rem", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 500 }}>
                    <Briefcase size={12} /> {selectedClient.rfp_enquiry_details?.designation || selectedClient.designation}
                  </span>
                )}
              </div>

              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.6)", border: "1px solid rgba(140, 174, 187, 0.15)", padding: "1rem", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Phone size={12} /> CONTACT PHONE
                </span>
                <p style={{ margin: "0.4rem 0 0 0", color: "#f8fafc", fontWeight: 500, fontSize: "0.95rem" }}>
                  {selectedClient.phone || "Not provided"}
                </p>
                {(selectedClient.rfp_enquiry_details?.country || selectedClient.country) && (
                  <p style={{ margin: "0.35rem 0 0 0", fontSize: "0.8rem", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Globe size={12} style={{ color: "#38bdf8" }} /> Country: <strong style={{ color: "#f8fafc" }}>{selectedClient.rfp_enquiry_details?.country || selectedClient.country}</strong>
                  </p>
                )}
              </div>

              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.6)", border: "1px solid rgba(140, 174, 187, 0.15)", padding: "1rem", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Building size={12} /> INDUSTRY / PROJECT TYPE
                </span>
                <p style={{ margin: "0.4rem 0 0 0", color: "#f8fafc", fontWeight: 500, fontSize: "0.9rem" }}>
                  {selectedClient.rfp_enquiry_details?.project_type || selectedClient.project_type || selectedClient.industry || selectedClient.source || "Direct Client"}
                </p>

                {(selectedClient.rfp_enquiry_details?.budget_range || selectedClient.budget_range) && (
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "#4ade80", fontWeight: 600 }}>
                    💰 RFP Budget: {selectedClient.rfp_enquiry_details?.budget_range || selectedClient.budget_range}
                  </p>
                )}
              </div>

              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.6)", border: "1px solid rgba(140, 174, 187, 0.15)", padding: "1rem", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Calendar size={12} /> CLOSED / WON DATE
                </span>
                <p style={{ margin: "0.4rem 0 0 0", color: "#f8fafc", fontWeight: 500, fontSize: "0.9rem" }}>
                  {new Date(selectedClient.updated_at).toLocaleString()}
                </p>
              </div>
            </div>

            {/* NDA Status & RFP Document Attachment */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{
                backgroundColor: (selectedClient.rfp_enquiry_details?.nda_required || selectedClient.nda_required) ? "rgba(245, 158, 11, 0.08)" : "rgba(10, 17, 28, 0.6)",
                border: `1px solid ${(selectedClient.rfp_enquiry_details?.nda_required || selectedClient.nda_required) ? "rgba(245, 158, 11, 0.3)" : "rgba(140, 174, 187, 0.15)"}`,
                padding: "1rem",
                borderRadius: "6px"
              }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>NDA AGREEMENT STATUS</span>
                <div style={{ marginTop: "0.4rem" }}>
                  {(selectedClient.rfp_enquiry_details?.nda_required || selectedClient.nda_required) ? (
                    <span style={{ color: "#fbbf24", fontWeight: 600, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <ShieldAlert size={15} /> Signed NDA Required Prior to Disclosure
                    </span>
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>Standard RFP (No NDA requested)</span>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: "rgba(10, 17, 28, 0.6)", border: "1px solid rgba(140, 174, 187, 0.15)", padding: "1rem", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8" }}>RFP DOCUMENT ATTACHMENT</span>
                <div style={{ marginTop: "0.4rem" }}>
                  {(selectedClient.rfp_enquiry_details?.document_attachment || selectedClient.document_attachment) ? (
                    <a
                      href={selectedClient.rfp_enquiry_details?.document_attachment || selectedClient.document_attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#63f5e8",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      <FileText size={15} /> Download Attached RFP Document 📎
                    </a>
                  ) : (
                    <span style={{ color: "#64748b", fontSize: "0.82rem" }}>No document uploaded</span>
                  )}
                </div>
              </div>
            </div>

            {/* Scope / Description Brief */}
            {(selectedClient.description || selectedClient.rfp_enquiry_details?.project_description) && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "rgba(5, 8, 17, 0.6)", border: "1px solid rgba(140, 174, 187, 0.15)", borderRadius: "6px" }}>
                <span style={{ fontSize: "0.7rem", fontFamily: "IBM Plex Mono, monospace", color: "#94a3b8", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <FileText size={12} /> PROJECT SCOPE / CLIENT BRIEF
                </span>
                <p style={{ margin: "0.5rem 0 0 0", color: "#cbd5e1", lineHeight: 1.6, fontSize: "0.88rem", whiteSpace: "pre-wrap" }}>
                  {selectedClient.description || selectedClient.rfp_enquiry_details?.project_description}
                </p>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
              <Button
                variant="outline"
                onClick={() => setSelectedClient(null)}
                style={{ fontSize: "0.85rem" }}
              >
                Close View
              </Button>
              {selectedClient.email && (
                <a href={`mailto:${selectedClient.email}`} style={{ textDecoration: "none" }}>
                  <Button
                    glow
                    style={{ fontSize: "0.85rem", backgroundColor: "#0284c7", color: "#ffffff" }}
                  >
                    <Mail size={14} style={{ marginRight: "0.35rem" }} /> Direct Email Client
                  </Button>
                </a>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Clients;
