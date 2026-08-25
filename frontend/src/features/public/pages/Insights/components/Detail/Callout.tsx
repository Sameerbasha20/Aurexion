import React from "react";
import { Info, AlertTriangle, Shield, Zap } from "lucide-react";

export const Callout = ({ type = "info", children }: { type?: any; children: any }) => {
  
  const getStyles = () => {
    switch(type) {
      case "key-insight":
        return {
          bg: "bg-primary/10",
          border: "border-primary/30",
          icon: <Zap className="w-5 h-5 text-primary" />,
          title: "Key Insight",
          titleColor: "text-primary"
        };
      case "security-note":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          icon: <Shield className="w-5 h-5 text-red-500" />,
          title: "Security Note",
          titleColor: "text-red-500"
        };
      case "engineering-note":
        return {
          bg: "bg-cyan-500/10",
          border: "border-cyan-500/30",
          icon: <Info className="w-5 h-5 text-cyan-500" />,
          title: "Engineering Note",
          titleColor: "text-cyan-500"
        };
      case "performance-note":
      default:
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          title: "Performance Note",
          titleColor: "text-amber-500"
        };
    }
  };

  const s = getStyles();

  return (
    <div className={`my-8 p-6 rounded-xl border ${s.bg} ${s.border} flex gap-4 items-start`}>
      <div className="flex-shrink-0 mt-1">
        {s.icon}
      </div>
      <div>
        <h5 className={`font-mono text-sm font-bold uppercase tracking-wider mb-2 ${s.titleColor}`}>
          {s.title}
        </h5>
        <div className="text-muted-foreground text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};
