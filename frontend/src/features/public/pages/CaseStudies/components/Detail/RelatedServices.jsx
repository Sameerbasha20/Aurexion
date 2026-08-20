import React from "react";
import { Link } from "wouter";
import { ArrowRight, Code } from "lucide-react";
import { servicesData } from "../../../../../../data/services";

export const RelatedServices = ({ caseStudy }) => {
  if (!caseStudy.services || caseStudy.services.length === 0) return null;

  const services = servicesData?.filter(s => caseStudy.services.includes(s.slug)) || [];
  if (services.length === 0) return null;

  return (
    <section className="py-12 bg-background border-b border-border/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-xs font-mono tracking-widest text-[#63f5e8] uppercase mb-8 font-bold">
          Core Engineering Capabilities Deployed
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link 
              key={service.slug} 
              href={`/services/${service.slug}`}
              className="p-6 bg-[#080f1a] border border-border/20 rounded-xl block hover:border-primary/50 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <Code className="w-5 h-5 text-[#63f5e8]" />
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#63f5e8] group-hover:translate-x-1 transition-all" />
              </div>
              <h4 className="font-bold text-lg text-white mb-2 group-hover:text-[#63f5e8] transition-colors">{service.name}</h4>
              <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedServices;