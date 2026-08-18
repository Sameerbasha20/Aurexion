import React from "react";
import { Link } from "wouter";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ServerErrorPageProps {
  onRetry?: () => void;
}

export const ServerErrorPage: React.FC<ServerErrorPageProps> = ({ onRetry }) => {
  return (
    <div className="bg-background min-h-screen flex items-center justify-center" style={{ background: "#050811" }}>
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,60,60,0.04) 0%, transparent 70%)",
          pointerEvents: "none"
        }}
      />
      <div style={{ maxWidth: "600px", width: "100%", padding: "0 max(4vw, 1.5rem)", textAlign: "center", position: "relative" }}>
        {/* Status code */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: "2rem" }}>
          <span
            style={{
              fontSize: "clamp(7rem, 20vw, 12rem)",
              fontWeight: 700,
              letterSpacing: "-.08em",
              lineHeight: 1,
              color: "transparent",
              WebkitTextStroke: "1px rgba(255,80,80,0.3)",
              display: "block",
              userSelect: "none"
            }}
          >
            500
          </span>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={36} color="#ff5050" strokeWidth={1.5} />
          </div>
        </div>

        {/* Eyebrow */}
        <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#ff5050", marginBottom: "1.5rem" }}>
          INTERNAL SERVER ERROR / SYSTEM FAULT
        </p>

        {/* Heading */}
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 500, letterSpacing: "-.05em", color: "#eef4f3", margin: "0 0 1rem" }}>
          System Error Detected
        </h1>

        {/* Description */}
        <p style={{ color: "#8da5ae", lineHeight: 1.7, fontSize: ".95rem", margin: "0 0 3rem" }}>
          An unexpected error occurred on our servers. Our engineering team has been automatically notified and is investigating the issue. Please try again in a few moments.
        </p>

        {/* Error detail box */}
        <div
          style={{
            border: "1px solid rgba(255,80,80,0.15)",
            background: "rgba(255,80,80,0.04)",
            padding: "1rem 1.5rem",
            marginBottom: "2.5rem",
            textAlign: "left"
          }}
        >
          <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".72rem", letterSpacing: ".08em", color: "#5e7079", lineHeight: 1.6 }}>
            <span style={{ color: "#ff5050" }}>ERROR_CODE:</span> 500 INTERNAL_SERVER_ERROR<br />
            <span style={{ color: "#ff5050" }}>TIMESTAMP:</span> {new Date().toISOString()}<br />
            <span style={{ color: "#ff5050" }}>ACTION:</span> Engineering team notified automatically.
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => (onRetry ? onRetry() : window.location.reload())}
            className="signal-button inline-flex items-center gap-2"
          >
            <RefreshCw size={14} /> RETRY REQUEST
          </button>
          <Link href="/" className="outline-button">
            RETURN TO HOME
          </Link>
          <a href="mailto:support@aurexion.io" className="text-button" style={{ display: "inline-flex", alignItems: "center" }}>
            CONTACT SUPPORT
          </a>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
