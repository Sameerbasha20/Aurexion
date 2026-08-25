import React from "react";
import { Link } from "wouter";

export const CaseStudyCTA = () => {
  return (
    <section className="py-24 md:py-32 bg-[#050B14] relative overflow-hidden border-t border-primary/20">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center border border-border/40 bg-card/10 backdrop-blur-sm p-10 md:p-16 rounded-2xl shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">Have a Similar Enterprise Challenge?</h2>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Talk with Aurexion's technology experts about architecture, engineering, modernization, and digital transformation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-flex h-12 md:h-14 items-center justify-center rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 shadow-[0_0_20px_rgba(99,245,232,0.3)]"
            >
              Discuss Your Challenge
            </Link>
            <Link 
              href="/rfp" 
              className="inline-flex h-12 md:h-14 items-center justify-center rounded-md border border-border/40 bg-transparent px-8 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black"
            >
              Request a Proposal
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseStudyCTA;
