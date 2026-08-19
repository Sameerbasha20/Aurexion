import React from "react";
import { aboutData } from "../../../../../data/about";
import DifferentiatorList from "../../../components/DifferentiatorList";

export const WhyAurexion: React.FC = () => {
  return (
    <DifferentiatorList
      title={aboutData.differentiators.title}
      items={aboutData.differentiators.items}
      backgroundColor="#0a0f18"
    />
  );
};

export default WhyAurexion;
