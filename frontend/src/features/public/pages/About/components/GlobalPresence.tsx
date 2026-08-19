import React from "react";
import { Globe, Server, Shield, Zap, MapPin } from "lucide-react";

const HUBS = [
  {
    region: "Americas Hub",
    cities: "San Francisco / New York",
    focus: "Enterprise AI & Cloud Architecture",
    latency: "<20ms P99",
    sla: "99.999%",
    status: "ACTIVE NODE"
  },
  {
    region: "EMEA Hub",
    cities: "London / Zurich",
    focus: "Regulatory Systems & Core Banking",
    latency: "<15ms P99",
    sla: "99.999%",
    status: "ACTIVE NODE"
  },
  {
    region: "APAC Hub",
    cities: "Singapore / Tokyo",
    focus: "Edge Networks & Digital Platforms",
    latency: "<25ms P99",
    sla: "99.999%",
    status: "ACTIVE NODE"
  },
  {
    region: "India Center of Excellence",
    cities: "Hyderabad / Bengaluru",
    focus: "Distributed Systems R&D & Scale",
    latency: "<30ms P99",
    sla: "99.999%",
    status: "ACTIVE NODE"
  }
];

export const GlobalPresence: React.FC = () => {
  return (
    <section className="py-24 bg-[#050811] border-y border-[rgba(99,245,232,0.12)] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[rgba(99,245,232,0.05)] rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#63f5e8] bg-[rgba(99,245,232,0.1)] border border-[rgba(99,245,232,0.25)] px-3 py-1 rounded">
              GLOBAL FOOTPRINT
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Built for a Global Enterprise Landscape
          </h2>
          <p className="text-lg text-[#8da5ae] leading-relaxed">
            Architecting solutions that scale across borders with 24/7 follow-the-sun engineering delivery.
          </p>
        </div>

        {/* Global Hubs 4-Column Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {HUBS.map((hub, index) => (
            <div
              key={index}
              className="p-6 bg-[#08101a] border border-[rgba(140,174,187,0.18)] hover:border-[#63f5e8] hover:bg-[#0c1828] rounded-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-[#63f5e8] bg-[rgba(99,245,232,0.12)] border border-[rgba(99,245,232,0.3)] px-2.5 py-0.5 rounded">
                    NODE 0{index + 1}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#63f5e8] uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#63f5e8] animate-pulse" />
                    {hub.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-[#63f5e8] transition-colors mb-1">
                  {hub.region}
                </h3>
                <p className="text-xs text-[#8da5ae] flex items-center gap-1 mb-4 font-mono">
                  <MapPin size={12} className="text-[#63f5e8]" /> {hub.cities}
                </p>

                <p className="text-sm text-gray-300 leading-relaxed mb-6">
                  {hub.focus}
                </p>
              </div>

              {/* Latency & SLA telemetry */}
              <div className="pt-4 border-t border-[rgba(140,174,187,0.15)] flex items-center justify-between font-mono text-xs">
                <div>
                  <span className="text-[10px] text-[#8da5ae] block">LATENCY</span>
                  <span className="text-[#63f5e8] font-bold">{hub.latency}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8da5ae] block">AVAILABILITY</span>
                  <span className="text-[#63f5e8] font-bold">{hub.sla}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global SLA / Delivery Strip */}
        <div className="max-w-6xl mx-auto p-6 bg-[#0a1424] border border-[rgba(99,245,232,0.25)] rounded-xl flex flex-col md:flex-row items-center justify-around gap-6 text-center">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-[#63f5e8]" />
            <span className="text-sm font-bold text-white">24/7 Follow-The-Sun Engineering</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-[rgba(99,245,232,0.2)]" />
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#63f5e8]" />
            <span className="text-sm font-bold text-white">Zero-Trust Global Security Protocols</span>
          </div>
          <div className="hidden md:block w-px h-8 bg-[rgba(99,245,232,0.2)]" />
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#63f5e8]" />
            <span className="text-sm font-bold text-white">99.999% Cross-Region SLA</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GlobalPresence;
