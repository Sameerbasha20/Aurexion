import React, { useState } from "react";
import { Link } from "wouter";
import { useLeadsQuery, useCreateLeadMutation } from "../../../../queries/useCrmQueries";
import crmService, { LeadItem, LeadQueryParams } from "../../services/crmService";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import SearchInput from "../../../../components/common/SearchInput";
import TableSkeleton from "../../../../components/common/TableSkeleton";
import EmptyState from "../../../../components/common/EmptyState";
import QueryErrorBanner from "../../../../components/common/QueryErrorBanner";
import LeadFormModal, { LeadFormValues } from "../../../../components/forms/LeadFormModal";
import {
  Filter,
  Plus,
  Download,
  Phone,
  Mail,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building,
  User,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
} from "lucide-react";

export const Leads: React.FC = () => {
  const [params, setParams] = useState<LeadQueryParams>({
    page: 1,
    page_size: 10,
    search: "",
    status: "",
    priority: "",
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string[] | string> | null>(null);

  // TanStack Query for server state
  const { data, isLoading, isFetching, error, refetch } = useLeadsQuery(params);
  const createLeadMutation = useCreateLeadMutation();

  const leads: LeadItem[] = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / (params.page_size || 10)) || 1;

  const handleDebouncedSearch = (searchVal: string) => {
    setParams((prev) => ({ ...prev, search: searchVal, page: 1 }));
  };

  const handleStatusChange = (status: string) => {
    setParams((prev) => ({ ...prev, status: status || undefined, page: 1 }));
  };

  const handlePriorityChange = (priority: string) => {
    setParams((prev) => ({ ...prev, priority: priority || undefined, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await crmService.exportLeads();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `aurexion-leads-export-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setActionSuccess("Leads exported successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to export leads.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateSubmit = async (values: LeadFormValues) => {
    setServerErrors(null);
    try {
      await createLeadMutation.mutateAsync(values);
      setIsCreateOpen(false);
      setActionSuccess("New lead established successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      if (err?.errors) {
        setServerErrors(err.errors);
      } else {
        alert(err?.userMessage || err?.message || "Failed to create lead.");
      }
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const s = status?.toUpperCase() || "";
    switch (s) {
      case "NEW":
        return { bg: "rgba(99, 245, 232, 0.12)", color: "#63f5e8", border: "rgba(99, 245, 232, 0.3)" };
      case "CONTACTED":
      case "UNDER_REVIEW":
        return { bg: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", border: "rgba(56, 189, 248, 0.3)" };
      case "QUALIFIED":
      case "PROPOSAL":
      case "NEGOTIATION":
        return { bg: "rgba(129, 140, 248, 0.12)", color: "#818cf8", border: "rgba(129, 140, 248, 0.3)" };
      case "WON":
        return { bg: "rgba(74, 222, 128, 0.12)", color: "#4ade80", border: "rgba(74, 222, 128, 0.3)" };
      case "LOST":
        return { bg: "rgba(248, 113, 113, 0.12)", color: "#f87171", border: "rgba(248, 113, 113, 0.3)" };
      default:
        return { bg: "rgba(140, 174, 187, 0.12)", color: "#cbd5e1", border: "rgba(140, 174, 187, 0.3)" };
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    const p = priority?.toUpperCase() || "";
    switch (p) {
      case "URGENT":
        return { color: "#f87171", bg: "rgba(248, 113, 113, 0.15)" };
      case "HIGH":
        return { color: "#fb923c", bg: "rgba(251, 146, 60, 0.15)" };
      case "MEDIUM":
        return { color: "#38bdf8", bg: "rgba(56, 189, 248, 0.15)" };
      default:
        return { color: "#94a3b8", bg: "rgba(148, 163, 184, 0.15)" };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            CRM Lead Management
            {isFetching && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
          </h1>
          <p className="text-slate-400 text-sm">
            Track, qualify, and convert commercial leads through automated enterprise pipeline stages.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="border-slate-700 hover:bg-slate-800 text-slate-300 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-medium flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            Establish New Lead
          </Button>
        </div>
      </div>

      {/* Alert Banners */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 rounded-xl flex items-center gap-2 text-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          {actionSuccess}
        </div>
      )}

      {error && <QueryErrorBanner error={error} onRetry={refetch} />}

      {/* Filter Toolbar */}
      <Card className="bg-slate-900/60 border-slate-800 p-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <SearchInput
            placeholder="Search leads by name, email, company..."
            onDebouncedChange={handleDebouncedSearch}
          />
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={params.status || ""}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1 md:w-40"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
            </select>

            <select
              value={params.priority || ""}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="h-10 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 flex-1 md:w-36"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {(params.search || params.status || params.priority) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setParams({ page: 1, page_size: 10, search: "", status: "", priority: "" })}
                className="text-slate-400 hover:text-slate-200"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content Area */}
      {isLoading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : leads.length === 0 ? (
        <EmptyState
          isSearchEmpty={!!(params.search || params.status || params.priority)}
          onReset={() => setParams({ page: 1, page_size: 10, search: "", status: "", priority: "" })}
          actionLabel="Establish New Lead"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Lead Name & Contact</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm text-slate-200">
                {leads.map((lead) => {
                  const statusStyle = getStatusBadgeStyle(lead.status);
                  const priorityStyle = getPriorityBadgeStyle(lead.priority);
                  return (
                    <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-100">{lead.name}</div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            {lead.email}
                          </span>
                          {lead.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {lead.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Building className="w-3.5 h-3.5 text-slate-500" />
                          {lead.company || "Individual Lead"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400 capitalize">
                        {lead.source?.toLowerCase().replace("_", " ") || "Website"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="px-2.5 py-1 text-xs font-medium rounded-full border"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            borderColor: statusStyle.border,
                          }}
                          title={lead.status?.toUpperCase() === "WON" ? "Won deal is locked (managed by BDM)" : "Change lead stage"}
                        >
                          {lead.status_display || lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="px-2 py-0.5 text-xs font-semibold rounded uppercase"
                          style={{
                            color: priorityStyle.color,
                            backgroundColor: priorityStyle.bg,
                          }}
                        >
                          {lead.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/crm/leads/${lead.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 flex items-center gap-1 ml-auto"
                          >
                            Manage
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 bg-slate-950/40 text-sm text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-200">{leads.length}</span> of{" "}
              <span className="font-semibold text-slate-200">{totalCount}</span> total records
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange((params.page || 1) - 1)}
                disabled={(params.page || 1) <= 1 || isFetching}
                className="border-slate-800 text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-xs px-2 text-slate-300">
                Page {params.page || 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange((params.page || 1) + 1)}
                disabled={(params.page || 1) >= totalPages || isFetching}
                className="border-slate-800 text-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Form Modal */}
      <LeadFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={createLeadMutation.isPending}
        serverErrors={serverErrors}
      />
    </div>
  );
};

export default Leads;
