import React from "react";
import { aboutData } from "../../../../../data/about";
import { ShieldCheck, KeyRound, FileSearch, Eye, Award } from "lucide-react";

const GOVERNANCE_DETAILS: Record<string, { icon: React.ElementType; desc: string }> = {
  "Security Governance": {
    icon: ShieldCheck,
    desc: "Rigorous alignment with ISO 27001, SOC 2 Type II, and enterprise cybersecurity policies.",
  },
  "Access Control": {
    icon: KeyRound,
    desc: "Least-privilege role-based access management across all development environments.",
  },
  "Auditability": {
    icon: FileSearch,
    desc: "Immutable change logs, commit traceability, and automated compliance verification.",
  },
  "Transparency": {
    icon: Eye,
    desc: "Open sprint telemetry, burndown metrics, and real-time status dashboards for clients.",
  },
  "Enterprise Standards": {
    icon: Award,
    desc: "Architectural review boards ensuring strict adherence to code quality and SLAs.",
  },
};

export const GovernanceSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#060c16] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#63f5e8]" />
            <span className="font-mono text-xs font-semibold tracking-[0.16em] uppercase text-[#63f5e8]">
              COMPLIANCE & INTEGRITY
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            {aboutData.governance.title}
          </h2>
          <p className="text-base md:text-lg text-gray-400 leading-relaxed">
            Aurexion operates under strict institutional standards, ensuring every software release adheres to global compliance, auditability, and zero-trust security.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {aboutData.governance.nodes.map((node: string, index: number) => {
            const detail = GOVERNANCE_DETAILS[node] || {
              icon: ShieldCheck,
              desc: "Adhering to strict enterprise governance standards.",
            };
            const Icon = detail.icon;

            return (
              <div
                key={index}
                className="p-6 bg-[#0b1420] border border-[#1b2b3d] rounded-xl hover:border-[#63f5e8]/40 hover:bg-[#0e1a2b] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#63f5e8]/10 border border-[#63f5e8]/20 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-[#63f5e8]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    {node}
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {detail.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#1b2b3d] flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <span>PILLAR 0{index + 1}</span>
                  <span className="text-[#63f5e8]">VERIFIED</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GovernanceSection;
