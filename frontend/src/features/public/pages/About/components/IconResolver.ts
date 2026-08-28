import React from "react";
import * as Lucide from "lucide-react";

export const getIconComponent = (
  iconName: string | React.ComponentType<{ className?: string }> | unknown
): React.ComponentType<{ className?: string }> => {
  if (!iconName) return Lucide.HelpCircle;
  if (typeof iconName === "function" || (typeof iconName === "object" && iconName && "render" in (iconName as Record<string, unknown>))) {
    return iconName as React.ComponentType<{ className?: string }>;
  }
  if (typeof iconName === "string") {
    const Icon = (Lucide as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return Icon || Lucide.HelpCircle;
  }
  return Lucide.HelpCircle;
};

export default getIconComponent;
