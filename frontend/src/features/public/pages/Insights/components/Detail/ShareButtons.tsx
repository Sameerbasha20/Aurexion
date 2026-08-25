import React from "react";
import { Link } from "lucide-react";

export const ShareButtons = ({ title }: { title: any }) => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleLinkedInShare = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "width=600,height=600"
    );
  };

  const handleXShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`,
      "_blank",
      "width=600,height=400"
    );
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
        <button 
          type="button" 
          onClick={handleLinkedInShare}
          className="w-10 h-10 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors font-bold font-mono"
          title="Share on LinkedIn"
        >
          in
        </button>
        <button 
          type="button" 
          onClick={handleXShare}
          className="w-10 h-10 rounded-full bg-card border border-border/40 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors font-bold font-mono"
          title="Share on X"
        >
          X
        </button>
      </div>
    </div>
  );
};
