import React, { useState } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import portalService from "../../services/portalService";
import usePortalQuery from "../../hooks/usePortalQuery";
import { ErrorState, LoadingState, EmptyState } from "../../components/StateViews";
import type { ClientDocumentItem } from "../../types/portal.types";
import { FolderLock, Download, RefreshCw, FileText, Lock, AlertTriangle } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  requirements: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  architecture: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  sow: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  report: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contract: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  invoice: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  deliverable: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  specification: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export const Documents: React.FC = () => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data: documents, isLoading, isError, error, refetch } = usePortalQuery<ClientDocumentItem[]>(
    ["portal", "documents"],
    () => portalService.getDocuments()
  );

  const handleDownload = async (doc: ClientDocumentItem) => {
    setDownloadingId(doc.id);
    setDownloadError(null);
    try {
      const res = await portalService.downloadDocument(doc.id);
      if (res.file_url) {
        window.open(res.file_url, "_blank");
      } else {
        setDownloadError(`File URL not available for ${doc.title}`);
      }
    } catch (err: any) {
      setDownloadError(err?.message || "Unauthorized document download request.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="DOCUMENT VAULT"
        title="Secure Document Repository"
        description="Access project requirements, architecture diagrams, SOWs, reports, and deliverables."
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "IBM Plex Mono, monospace" }}>
              <Lock size={12} /> AUTHENTICATED ACCESS ONLY
            </span>
            <Button variant="outline" size="sm" onClick={refetch}>
              <RefreshCw size={14} style={{ marginRight: "0.35rem" }} />
              Refresh Repository
            </Button>
          </div>
        }
      />

      {downloadError && (
        <div style={{
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          color: "#ef4444",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          padding: "0.75rem 1rem",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.85rem",
        }}>
          <AlertTriangle size={16} />
          {downloadError}
        </div>
      )}

      {isLoading ? (
        <LoadingState label="LOADING REPOSITORY DOCUMENTS..." rows={3} />
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} title="Unable to load documents" />
      ) : !documents || documents.length === 0 ? (
        <EmptyState title="No project documents available" description="Official account documents, project requirements, SOWs, and architectural diagrams will be published here." />
      ) : (
        <div style={{ display: "grid", gap: "1.25rem", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          {documents.map((doc) => (
            <Card key={doc.id} glowOnHover style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FileText size={18} color="#63f5e8" />
                  <h3 style={{ margin: 0, fontSize: "1rem", color: "#f8fafc", fontWeight: 600 }}>
                    {doc.title}
                  </h3>
                </div>
                <Badge className={TYPE_COLORS[doc.document_type] || "bg-gray-500/20 text-gray-400"}>
                  {doc.document_type_display || doc.document_type}
                </Badge>
              </div>

              {doc.project_title && (
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0 0 0.5rem 0" }}>
                  Project: <strong style={{ color: "#cbd5e1" }}>{doc.project_title}</strong>
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem", borderTop: "1px solid rgba(140,174,187,0.1)", paddingTop: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "IBM Plex Mono, monospace" }}>
                  {doc.file_size} · {new Date(doc.uploaded_at).toLocaleDateString()}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={downloadingId === doc.id}
                  onClick={() => handleDownload(doc)}
                  style={{ fontSize: "0.75rem" }}
                >
                  <Download size={13} style={{ marginRight: "0.3rem" }} />
                  {downloadingId === doc.id ? "Authorizing..." : "Secure Download"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;