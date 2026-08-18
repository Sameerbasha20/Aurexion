import React from "react";
import { Construction } from "lucide-react";
import { Card } from "../../../components/ui/card";

interface ModuleUnavailableProps {
  module: string;
  description?: string;
}

export const ModuleUnavailable: React.FC<ModuleUnavailableProps> = ({ module, description }) => (
  <Card>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#63f5e8" }}>
        <Construction size={18} />
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.72rem", letterSpacing: "0.1em" }}>
          MODULE NOT AVAILABLE
        </span>
      </div>
      <h3 style={{ margin: 0, fontSize: "1.25rem" }}>{module}</h3>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", margin: 0, lineHeight: 1.6, maxWidth: "680px" }}>
        {description ||
          "This module is not currently exposed by the Aurexion API for client users. No placeholder or mock data is shown. This module will appear here automatically once the backend capability is available."}
      </p>
    </div>
  </Card>
);

export default ModuleUnavailable;