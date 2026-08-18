import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Handshake, CheckCircle2, ShieldCheck, ArrowRight, Building2, Globe, Users, Zap } from "lucide-react";

const partnerSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  website: z.string().url("Valid website URL required").or(z.literal("")),
  contactName: z.string().min(2, "Contact name is required"),
  workEmail: z.string().email("Valid corporate email required"),
  phone: z.string().min(7, "Phone number is required"),
  partnerType: z.string().min(1, "Select a partnership type"),
  companySize: z.string().min(1, "Select company size"),
  proposal: z.string().min(30, "Please provide at least 30 characters detailing your partnership proposal"),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the partnership terms")
});

type PartnerFormData = z.infer<typeof partnerSchema>;

export const PartnerWithUsPage: React.FC = () => {
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      partnerType: "Technology Partner",
      companySize: "10-50 employees",
      agreeToTerms: false
    }
  });

  const onSubmit = (data: PartnerFormData) => {
    setIsSubmitting(true);

    setTimeout(() => {
      const year = new Date().getFullYear();
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const refId = `AUR-PTR-${year}-${randomNum}`;
      
      setIsSubmitting(false);
      setSubmittedRef(refId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 800);
  };

  return (
    <div className="bg-background min-h-screen text-foreground">
      {/* Hero Header */}
      <section className="pt-24 pb-16 bg-[#050B14] relative overflow-hidden border-b border-border/10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-4">
              <Handshake className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">
                STRATEGIC ALLIANCES & PARTNERSHIPS
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white leading-tight">
              Partner With Aurexion Technologies
            </h1>
            
            <p className="text-lg text-gray-300 leading-relaxed">
              Join our global ecosystem of technology providers, enterprise solution partners, systems integrators, and strategic advisors to deliver co-engineered digital transformation solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-12 bg-card/20 border-b border-border/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: "Technology Ecosystem", desc: "Co-build and integrate cloud, AI/ML, and SaaS platforms." },
              { icon: Globe, title: "Global Expansion", desc: "Access international enterprise client networks across 18 industries." },
              { icon: Users, title: "Dedicated Alliances Team", desc: "Direct joint-go-to-market support and technical architecture advisory." },
              { icon: Zap, title: "Accelerated Delivery", desc: "Leverage our 32 engineering domains for high-throughput scaling." }
            ].map((pillar, idx) => (
              <div key={idx} className="p-5 bg-card border border-border/40 rounded-xl">
                <pillar.icon className="w-6 h-6 text-primary mb-3" />
                <h3 className="font-bold text-white mb-1">{pillar.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {submittedRef ? (
              <div className="p-8 sm:p-12 bg-card border border-primary/30 rounded-2xl shadow-2xl text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                
                <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase mb-2 block">
                  PARTNERSHIP PROPOSAL RECEIVED
                </span>
                <h2 className="text-3xl font-bold text-white mb-4">Welcome to the Aurexion Alliance Program</h2>
                <p className="text-base text-gray-300 leading-relaxed max-w-xl mx-auto mb-6">
                  Your partnership application has been indexed into our Partner Relations CRM. Our Alliance Director will review your proposal and schedule an introductory briefing within 24 business hours.
                </p>

                <div className="p-4 bg-background border border-border/40 rounded-xl inline-block mb-8">
                  <span className="text-xs font-mono text-muted-foreground block mb-1">YOUR TRACKING REFERENCE</span>
                  <span className="text-xl font-mono font-bold text-primary">{submittedRef}</span>
                </div>

                <div>
                  <button
                    onClick={() => setSubmittedRef(null)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border/40 rounded-2xl p-6 sm:p-10 shadow-2xl">
                <div className="border-b border-border/20 pb-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Partner Application Form</h2>
                  <p className="text-sm text-muted-foreground">
                    Complete the details below to initiate formal strategic partnership discussions with Aurexion Technologies.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Company Name *
                      </label>
                      <input
                        {...register("companyName")}
                        type="text"
                        placeholder="e.g. AcroTech Global"
                        className="w-full h-11 px-4 bg-background border border-border/40 rounded-md text-foreground focus:border-primary focus:outline-none text-sm"
                      />
                      {errors.companyName && (
                        <span className="text-xs text-destructive mt-1 block">{errors.companyName.message}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Company Website
                      </label>
                      <input
                        {...register("website")}
                        type="url"
                        placeholder="https://example.com"
                        className="w-full h-11 px-4 bg-background border border-border/40 rounded-md text-foreground focus:border-primary focus:outline-none text-sm"
                      />
                      {errors.website && (
                        <span className="text-xs text-destructive mt-1 block">{errors.website.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Contact Person Name *
                      </label>
                      <input
                        {...register("contactName")}
                        type="text"
                        placeholder="e.g. Robert Vance"
                        className="w-full h-11 px-4 bg-background border border-border/40 rounded-md text-foreground focus:border-primary focus:outline-none text-sm"
                      />
                      {errors.contactName && (
                        <span className="text-xs text-destructive mt-1 block">{errors.contactName.message}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Work Email *
                      </label>
                      <input
                        {...register("workEmail")}
                        type="email"
                        placeholder="r.vance@acrotech.com"
                        className="w-full h-11 px-4 bg-background border border-border/40 rounded-md text-foreground focus:border-primary focus:outline-none text-sm"
                      />
                      {errors.workEmail && (
                        <span className="text-xs text-destructive mt-1 block">{errors.workEmail.message}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        {...register("phone")}
                        type="text"
                        placeholder="+1 (555) 019-2834"
                        className="w-full h-11 px-4 bg-background border border-border/40 rounded-md text-foreground focus:border-primary focus:outline-none text-sm"
                      />
                      {errors.phone && (
                        <span className="text-xs text-destructive mt-1 block">{errors.phone.message}</span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Partnership Category *
                      </label>
                      <select
                        {...register("partnerType")}
                        className="w-full h-11 px-4 bg-background border border-border/40 rounded-md text-foreground focus:border-primary focus:outline-none text-sm"
                      >
                        <option value="Technology Partner">Technology Partner (Cloud/AI/ISV)</option>
                        <option value="Solution Integrator">Solution Integrator / VAR</option>
                        <option value="Referral & Affiliate">Referral & Affiliate Partner</option>
                        <option value="Strategic Alliance">Strategic Enterprise Alliance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
                        Company Size *
                      </label>
                      <select
                        {...register("companySize")}
                        className="w-full h-11 px-4 bg-background border border-border/40 rounded-md text-foreground focus:border-primary focus:outline-none text-sm"
                      >
                        <option value="1-10 employees">1 - 10 employees</option>
                        <option value="10-50 employees">10 - 50 employees</option>
                        <option value="50-250 employees">50 - 250 employees</option>
                        <option value="250+ employees">250+ Enterprise employees</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Partnership Proposal & Scope * (Min 30 characters)
                    </label>
                    <textarea
                      {...register("proposal")}
                      rows={5}
                      placeholder="Describe your solution, target market synergy, and proposed engagement model..."
                      className="w-full p-4 bg-background border border-border/40 rounded-md text-foreground focus:border-primary focus:outline-none text-sm"
                    />
                    {errors.proposal && (
                      <span className="text-xs text-destructive mt-1 block">{errors.proposal.message}</span>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-background/50 border border-border/30 rounded-lg">
                    <input
                      {...register("agreeToTerms")}
                      type="checkbox"
                      id="agreeToTerms"
                      className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="agreeToTerms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                      I confirm that I am authorized to submit this partnership inquiry on behalf of my organization and agree to Aurexion's Partnership Governance & Data Processing policies.
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <span className="text-xs text-destructive block">{errors.agreeToTerms.message}</span>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-12 w-full sm:w-auto items-center justify-center px-8 bg-primary text-primary-foreground font-mono text-sm font-bold rounded-md hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? "PROCESSING..." : "SUBMIT PARTNERSHIP APPLICATION"}
                    {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2" />}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnerWithUsPage;
