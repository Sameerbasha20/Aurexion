import React from "react";
import { Link } from "wouter";

export const ServiceCTA: React.FC = () => {
  return (
    <section className="py-14 bg-[#050B14] border-t border-primary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Have an Enterprise Technology Challenge?</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/contact" 
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)]"
          >
            Talk to Our Experts
          </Link>
          <Link 
            href="/rfp" 
            className="inline-flex h-12 items-center justify-center rounded-md border border-border/40 bg-card/10 px-8 text-sm font-bold text-white transition-colors hover:bg-card/30"
          >
            Request a Proposal
          </Link>
        </div>
      </div>
    </section>
  );
};
