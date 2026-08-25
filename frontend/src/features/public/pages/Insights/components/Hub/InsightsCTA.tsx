import React, { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Link } from "wouter";

export const InsightsCTA = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleSubscribe = (e: any) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      setTimeout(() => setStatus("idle"), 3000);
    }, 1000);
  };

  return (
    <section className="py-24 bg-card border-t border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Newsletter Form */}
          <div className="bg-background p-8 md:p-12 rounded-2xl border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-cyan-400" />
            
            <h3 className="text-3xl font-bold mb-4">Stay Ahead of Enterprise Technology</h3>
            <p className="text-muted-foreground mb-8">
              Subscribe to receive deep technical insights, architecture patterns, and engineering thought leadership directly in your inbox.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="Work Email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-border/40 rounded-md bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  disabled={status === "loading" || status === "success"}
                />
              </div>
              
              <button 
                type="submit"
                disabled={status === "loading" || status === "success"}
                className="w-full inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Subscribing..." : status === "success" ? "Subscribed Successfully!" : "Subscribe"}
              </button>
            </form>
          </div>

          {/* Final Project CTA */}
          <div>
            <h3 className="text-3xl font-bold mb-6">Have a Technology Challenge?</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Translate these insights into actionable engineering solutions. Partner with Aurexion to build, scale, and secure your enterprise platforms.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Talk to Our Experts
              </Link>
              <Link 
                href="/services"
                className="inline-flex h-12 items-center justify-center rounded-md border border-border/40 bg-card px-8 text-sm font-bold text-foreground transition-colors hover:border-primary/50 hover:bg-muted"
              >
                Explore Services
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
