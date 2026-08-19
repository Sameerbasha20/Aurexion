import React from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ eyebrow, title, description, actions }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 style={{ fontSize: "2rem", margin: "0.5rem 0 0 0" }}>{title}</h1>
        </div>
        {actions}
      </div>
      {description && (
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", maxWidth: "680px", lineHeight: 1.6, margin: 0 }}>
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;