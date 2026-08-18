import React from "react";
import PageHeader from "../../components/PageHeader";
import ModuleUnavailable from "../../components/ModuleUnavailable";

export const Documents: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="VAULT INTERACTION"
        title="Documents"
        description="Secure document repository for your client account."
      />
      <ModuleUnavailable
        module="Documents"
        description="The Aurexion API does not currently expose a documents endpoint for client users. No placeholder or mock documents are shown. Documents will appear here automatically once the backend capability is available."
      />
    </div>
  );
};

export default Documents;