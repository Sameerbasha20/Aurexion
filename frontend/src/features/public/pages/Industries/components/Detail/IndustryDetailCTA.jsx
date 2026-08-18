import React from "react";
import { Link } from "wouter";

export const IndustryDetailCTA = ({ industry }) => {
  return (
    <section className="py-32 bg-[#050B14] relative overflow-hidden border-t border-primary/20">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center border border-border/40 bg-card/10 backdrop-blur-sm p-12 md:p-20 rounded-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Have a {industry.name}-Specific Technology Challenge?</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Discuss your business requirements and regulatory constraints with Aurexion's technology experts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-flex h-14 items-center justify-center rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 shadow-[0_0_20px_rgba(var(--primary),0.3)]"
            >
              Talk to Our Experts
            </Link>
            <Link 
              href="/rfp" 
              className="inline-flex h-14 items-center justify-center rounded-md border border-border/40 bg-transparent px-8 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black"
            >
              Request a Proposal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
