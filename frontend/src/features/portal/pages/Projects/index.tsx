import React from "react";
import PageHeader from "../../components/PageHeader";
import ModuleUnavailable from "../../components/ModuleUnavailable";

export const Projects: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <PageHeader
        eyebrow="WORK SCOPE"
        title="Projects"
        description="Project portfolio overview for your client account."
      />
      <ModuleUnavailable
        module="Projects"
        description="The Aurexion API does not currently expose a projects endpoint for client users. No placeholder or mock projects are shown. Projects will appear here automatically once the backend capability is available."
      />
    </div>
  );
};

export default Projects;