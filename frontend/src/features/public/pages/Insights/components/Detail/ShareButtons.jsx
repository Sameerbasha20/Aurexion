import React from "react";
import { Link } from "lucide-react";

export const ShareButtons = ({ title }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="flex items-center gap-4 py-8 border-t border-border/40 mt-16">
      <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Share:</span>
      <div className="flex gap-2">
        <button type="button" 
          onClick={handleCopyLink}
          className="w-10 h-10 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          title="Copy Link"
        >
          <Link className="w-4 h-4" />
        </button>
        {/* Placeholder for actual social integrations */}
        <button type="button" className="w-10 h-10 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors font-bold font-mono">
          in
        </button>
        <button type="button" className="w-10 h-10 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors font-bold font-mono">
          X
        </button>
      </div>
    </div>
  );
};
