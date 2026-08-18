import React, { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../../../components/ui/card";
import Button from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import portalService from "../../services/portalService";
import { FolderLock, Download, ExternalLink, RefreshCw, FileText } from "lucide-react";

interface DocumentItem {
  id: number;
  title: string;
  document_type: string;
  document_type_display: string;
  project_title: string | null;
  file_url: string;
  file_size: string;
  uploaded_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  contract: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  invoice: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  deliverable: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  specification: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await portalService.getDocuments();
      setDocuments(data);
    } catch {
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="ACCOUNT REPOSITORY"
        title="Documents & Deliverables"
        description="Access contracts, invoices, specifications, and project deliverables."
        actions={
          <Button variant="outline" size="sm" onClick={fetchDocuments}>
            <RefreshCw size={14} style={{ marginRight: "0.35rem" }} />
            Refresh Repository
          </Button>
        }
      />

      {isLoading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#63f5e8" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 1rem" }} />
          <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem" }}>
            LOADING REPOSITORY DOCUMENTS...
          </p>
        </div>
      ) : documents.length === 0 ? (
        <Card style={{ padding: "3rem", textAlign: "center" }}>
          <FolderLock size={36} color="#64748b" style={{ margin: "0 auto 1rem" }} />
          <h3 style={{ fontSize: "1.2rem", color: "#f8fafc", margin: 0 }}>No documents found</h3>
          <p style={{ color: "#94a3b8", fontSize: "0.88rem", margin: "0.5rem 0 0 0" }}>
            Official account documents, signed contracts, and project deliverables will be published here.
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
          {documents.map((doc) => (
            <Card key={doc.id} style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
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

                {doc.file_url ? (
                  <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <Button variant="outline" size="sm" style={{ fontSize: "0.75rem" }}>
                      <Download size={13} style={{ marginRight: "0.3rem" }} /> View / Download
                    </Button>
                  </a>
                ) : (
                  <Button variant="outline" size="sm" disabled style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                    Processing
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents;