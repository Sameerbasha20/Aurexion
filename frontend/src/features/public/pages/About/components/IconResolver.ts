import * as Lucide from "lucide-react";

export const getIconComponent = (iconName: any): any => {
  if (!iconName) return Lucide.HelpCircle;
  if (typeof iconName === "function" || (typeof iconName === "object" && iconName.render)) {
    return iconName; // Already a component
  }
  const Icon = (Lucide as any)[iconName];
  return Icon || Lucide.HelpCircle;
};

export default getIconComponent;
