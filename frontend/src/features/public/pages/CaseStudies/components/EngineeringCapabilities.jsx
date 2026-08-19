import React from "react";
import { ShieldCheck, Server, Cpu, RefreshCw } from "lucide-react";

export const EngineeringCapabilities = () => {
  const capabilities = [
    { icon: Server, title: "Cloud Architecture", desc: "Scalable, resilient infrastructure engineering." },
    { icon: ShieldCheck, title: "Enterprise Security", desc: "Zero-trust networks and strict RBAC implementation." },
    { icon: Cpu, title: "AI & Machine Learning", desc: "Data pipelines and predictive model deployment." },
    { icon: RefreshCw, title: "Agile CI/CD", desc: "Automated testing and zero-downtime deployments." }
  ];

  return (
    <section className="pt-16 pb-8 sm:pt-20 sm:pb-10 bg-[#0a0f18] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Engineering Capabilities</h2>
          <p className="text-gray-400">Our approach to complex software development is rooted in rigorous technical standards and modern architectural patterns.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {capabilities.map((cap, idx) => (
            <div key={idx} className="p-8 bg-card/20 border border-border/30 rounded-xl hover:bg-card/40 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mb-6">
                <cap.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{cap.title}</h3>
              <p className="text-sm text-gray-400">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
