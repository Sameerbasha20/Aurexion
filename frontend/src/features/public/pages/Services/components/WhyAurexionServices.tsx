import React from "react";
import { Code, Eye, Lock, Zap, Settings } from "lucide-react";
import DifferentiatorList from "../../../components/DifferentiatorList";

const differentiators = [
  {
    number: "01",
    title: "Senior Engineering Focus",
    description: "Teams composed of veteran architects and senior developers.",
    icon: Code,
  },
  {
    number: "02",
    title: "Transparent Delivery",
    description: "Complete visibility into our agile processes and code quality.",
    icon: Eye,
  },
  {
    number: "03",
    title: "IP Security",
    description: "Rigorous protection of your intellectual property and data.",
    icon: Lock,
  },
  {
    number: "04",
    title: "Agile Methodology",
    description: "Adaptable execution designed for complex enterprise changes.",
    icon: Zap,
  },
  {
    number: "05",
    title: "Performance Benchmarks",
    description: "Engineering measured against strict operational SLAs.",
    icon: Settings,
  },
];

export const WhyAurexionServices: React.FC = () => {
  return (
    <DifferentiatorList
      title="Why Partner With Aurexion"
      items={differentiators}
      backgroundColor="#050B14"
    />
  );
};

export default WhyAurexionServices;
