import React from "react";
import { ArrowRight } from "lucide-react";

export const TransformationSection = () => {
  return (
    <section className="py-8 bg-background border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Transformation</h2>
        </div>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          
          <div className="flex-1 bg-card border border-destructive/30 rounded-xl p-8 w-full text-center opacity-80">
            <span className="text-xs font-mono font-bold text-destructive tracking-widest mb-6 block">BEFORE</span>
            <ul className="space-y-4 text-muted-foreground font-medium">
              <li>Legacy Architecture</li>
              <li>Manual Processes</li>
              <li>Fragmented Systems</li>
              <li>Scalability Limits</li>
            </ul>
          </div>

          <div className="flex-shrink-0 hidden md:block">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-primary" />
            </div>
          </div>

          <div className="flex-1 bg-card border border-primary/50 rounded-xl p-8 w-full text-center shadow-[0_0_30px_rgba(var(--primary),0.1)] relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
            <span className="text-xs font-mono font-bold text-primary tracking-widest mb-6 block relative z-10">AUREXION ENGINEERING</span>
            <ul className="space-y-4 text-foreground font-bold relative z-10">
              <li>Modern Cloud Native</li>
              <li>Automated CI/CD</li>
              <li>Integrated Ecosystem</li>
              <li>Infinite Scalability</li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
};
