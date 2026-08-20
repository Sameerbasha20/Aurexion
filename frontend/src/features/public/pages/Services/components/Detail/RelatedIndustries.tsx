import React from "react";
import { ServiceDetail } from "../../../../types/website.types";
import { industriesData } from "../../../../../../data/industries";
import { Link } from "wouter";
import { ArrowUpRight, Landmark, LineChart, ShieldCheck, Activity, GraduationCap, Factory, ShoppingBag, ShoppingCart, Truck, Building, HardHat, Utensils, Plane, Car, Signal, Briefcase, Rocket } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Landmark, LineChart, ShieldCheck, Activity, GraduationCap, Factory,
  ShoppingBag, ShoppingCart, Truck, Building, HardHat, Utensils,
  Plane, Car, Signal, Briefcase, Rocket
};

interface RelatedIndustriesProps {
  service: ServiceDetail;
}

export const RelatedIndustries: React.FC<RelatedIndustriesProps> = ({ service }) => {
  if (!service.relatedIndustries || service.relatedIndustries.length === 0) return null;

  // Match each name to the industriesData entry (by name or slug)
  const matched = service.relatedIndustries.map((name: string) => {
    const found = industriesData.find(
      (ind: any) =>
        ind.name.toLowerCase() === name.toLowerCase() ||
        ind.slug.toLowerCase() === name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    );
    return found ?? { slug: name.toLowerCase().replace(/\s+/g, "-"), name, icon: "Briefcase" };
  });

  return (
    <section className="py-12 bg-[#050B14] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-mono text-[#63f5e8] tracking-widest uppercase mb-2">MARKET VERTICALS</p>
            <h2 className="text-3xl font-bold text-white">Industries We Serve</h2>
          </div>
          <Link href="/industries" className="hidden sm:flex items-center gap-1 text-xs font-mono text-[#63f5e8] hover:underline">
            ALL 18 INDUSTRIES <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {matched.map((industry: any, index: number) => {
            const Icon = ICON_MAP[industry.icon] ?? Briefcase;
            return (
              <Link
                key={index}
                href={`/industries/${industry.slug}`}
                className="group flex items-center justify-between p-5 bg-[#0a111c] border border-[rgba(140,174,187,0.15)] rounded-lg hover:bg-[#0d1a2a] hover:border-[rgba(99,245,232,0.4)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-md bg-[rgba(99,245,232,0.06)] border border-[rgba(99,245,232,0.15)] flex items-center justify-center group-hover:bg-[rgba(99,245,232,0.12)] transition-colors">
                    <Icon className="w-4 h-4 text-[#63f5e8]" />
                  </div>
                  <span className="text-sm font-semibold text-[#c8d8e0] group-hover:text-white transition-colors leading-tight">{industry.name}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[rgba(99,245,232,0.3)] group-hover:text-[#63f5e8] transition-colors flex-shrink-0 ml-2" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

