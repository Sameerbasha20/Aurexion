import React from "react";
import { Shield, Lock, Search, Network } from "lucide-react";

export const SecurityGovernance = () => {
  return (
    <section className="py-24 bg-[#0a0f18] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise Trust & Security</h2>
            <p className="text-gray-400 leading-relaxed">
              We design every solution with security and governance as foundational pillars, ensuring compliance across strict regulatory environments.
            </p>
          </div>
          
          <div className="md:w-2/3 grid sm:grid-cols-2 gap-6 w-full">
            <div className="p-6 bg-card/20 border border-border/30 rounded-lg flex gap-4">
              <Network className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white mb-1">OWASP Top 10</h4>
                <p className="text-sm text-gray-400">Strict adherence to secure coding standards and vulnerability mitigation.</p>
              </div>
            </div>
            
            <div className="p-6 bg-card/20 border border-border/30 rounded-lg flex gap-4">
              <Lock className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white mb-1">Strict RBAC & Encryption</h4>
                <p className="text-sm text-gray-400">Granular access control and encryption for data at rest and in transit.</p>
              </div>
            </div>
            
            <div className="p-6 bg-card/20 border border-border/30 rounded-lg flex gap-4">
              <Search className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white mb-1">Immutable Audit Logs</h4>
                <p className="text-sm text-gray-400">Tamper-proof system event tracing and compliance reporting.</p>
              </div>
            </div>
            
            <div className="p-6 bg-card/20 border border-border/30 rounded-lg flex gap-4">
              <Shield className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-bold text-white mb-1">Scalable Architecture</h4>
                <p className="text-sm text-gray-400">Container-ready microservices designed for zero-downtime scaling.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
