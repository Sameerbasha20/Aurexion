import React from "react";
import PageHeader from "../../components/PageHeader";
import ModuleUnavailable from "../../components/ModuleUnavailable";

export const Requests: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="REQUEST WORKFLOW"
        title="Requests"
        description="Work order and resource provisioning requests for your client account."
      />
      <ModuleUnavailable
        module="Requests"
        description="The Aurexion API does not currently expose a client requests endpoint. No placeholder or mock requests are shown. Requests will appear here automatically once the backend capability is available. For general assistance, please use the Support module."
      />
    </div>
  );
};

export default Requests;