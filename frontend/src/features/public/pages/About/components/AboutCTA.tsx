import React from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

export const AboutCTA: React.FC = () => {
  return (
    <section className="py-20 bg-[#080d16] border-t border-border/10 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="font-mono text-xs font-semibold tracking-[0.16em] uppercase text-[#63f5e8] bg-[#63f5e8]/10 border border-[#63f5e8]/25 px-3 py-1 rounded">
              ENTERPRISE ENGAGEMENT
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Let's Build What Comes Next
          </h2>
          <p className="text-base md:text-lg text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Partner with Aurexion to engineer scalable, secure, and intelligent solutions for your mission-critical enterprise challenges.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#63f5e8] text-[#050811] font-mono text-xs font-bold tracking-wider rounded uppercase hover:bg-[#4ee8da] hover:shadow-[0_0_20px_rgba(99,245,232,0.4)] transition-all duration-200"
            >
              TALK TO AN EXPERT <ArrowUpRight size={15} />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent text-white border border-[#1b2b3d] font-mono text-xs font-bold tracking-wider rounded uppercase hover:border-[#63f5e8]/50 hover:bg-[#0b1420] transition-all duration-200"
            >
              EXPLORE CAPABILITIES
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;
