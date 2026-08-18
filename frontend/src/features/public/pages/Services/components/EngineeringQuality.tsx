import React from "react";
import { Shield, Lock, Search, Network, Settings, Database } from "lucide-react";

const principles = [
  {
    title: "OWASP Top 10 Compliance",
    description: "Strict adherence to secure coding standards and vulnerability mitigation.",
    icon: Shield
  },
  {
    title: "Strict RBAC Enforcement",
    description: "Granular Role-Based Access Control ensuring secure enterprise data access.",
    icon: Lock
  },
  {
    title: "Immutable Audit Logs",
    description: "Tamper-proof system event tracing and compliance tracking.",
    icon: Search
  },
  {
    title: "End-to-End Encryption",
    description: "Enterprise-grade encryption protocols for data at rest and in transit.",
    icon: Network
  },
  {
    title: "Clean Django/DRF Patterns",
    description: "Rigorous backend architectural standards ensuring maintainability.",
    icon: Settings
  },
  {
    title: "Container-Ready Architecture",
    description: "Dockerized, stateless microservices ready for Kubernetes scaling.",
    icon: Database
  }
];

export const EngineeringQuality: React.FC = () => {
  return (
    <section className="py-24 bg-background border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Engineering Quality & Security</h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Our engineering teams adhere strictly to industry-leading security frameworks and architectural best practices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex gap-4 p-6 bg-card border border-border/40 rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
