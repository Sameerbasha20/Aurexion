import React from "react";
import { aboutData } from "../../../../../data/about";
import DifferentiatorList from "../../../components/DifferentiatorList";
import { getIconComponent } from "./IconResolver";

interface WhyAurexionProps {
  data?: {
    title?: string;
    items?: Array<{
      number?: string;
      title: string;
      description: string;
      icon: any;
    }>;
  };
}

export const WhyAurexion: React.FC<WhyAurexionProps> = ({ data }) => {
  const title = data?.title || aboutData.differentiators.title;
  const rawItems = data?.items || aboutData.differentiators.items;

  const items = (rawItems || []).map((item) => ({
    ...item,
    icon: getIconComponent(item.icon),
  }));

  return (
    <DifferentiatorList
      title={title}
      items={items}
      backgroundColor="#0a0f18"
    />
  );
};

export default WhyAurexion;

