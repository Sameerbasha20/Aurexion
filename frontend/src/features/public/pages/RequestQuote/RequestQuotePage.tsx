import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { publicService } from "../../services/publicService";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { SEO } from "../../../../components/seo/SEO";

const quoteSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone number is required"),
  company: z.string().min(2, "Company name is required"),
  service: z.string().min(2, "Service type is required"),
  requirements: z.string().min(10, "Please provide more detail about your requirements"),
  budget: z.string().optional(),
  timeline: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

export const RequestQuotePage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema)
  });

  const onSubmit = async (data: QuoteFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await publicService.requestQuote(data);
      setSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background pt-24 pb-24">
      <SEO
        title="Request a Custom Engineering Quote | Aurexion"
        description="Request a formal commercial proposal and technical scope assessment for your enterprise software, cloud migration, or AI project."
        canonical="/request-quote"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-16">
          <p className="text-primary font-mono text-sm tracking-widest mb-6">PROJECT INQUIRY</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter leading-tight mb-6">
            Request a <span className="text-muted-foreground">Quote.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Provide us with some initial details about your project, and our engineering team will get back to you with an estimate and next steps.
          </p>
        </div>

        <div className="bg-card border border-border/40 rounded-lg p-8 md:p-12">
          {success ? (
            <div className="py-12 flex flex-col items-center text-center">
              <CheckCircle2 className="h-16 w-16 text-primary mb-6" />
              <h3 className="text-2xl font-bold mb-4">Request Received</h3>
              <p className="text-muted-foreground max-w-md">
                Thank you for your interest in Aurexion. Our solutions team is reviewing your requirements and will contact you within 24-48 hours.
              </p>
              <button type="button" 
                onClick={() => setSuccess(false)} 
                className="mt-8 text-primary hover:underline text-sm font-medium"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <>
              {submitError && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-sm">{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold border-b border-border/40 pb-2 mb-6">Contact Information</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-muted-foreground">Full Name <span className="text-destructive">*</span></label>
                      <input 
                        id="name" 
                        {...register("name")} 
                        className={`w-full p-3 rounded-md bg-background border ${errors.name ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary`} 
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-muted-foreground">Work Email <span className="text-destructive">*</span></label>
                      <input 
                        id="email" 
                        type="email"
                        {...register("email")} 
                        className={`w-full p-3 rounded-md bg-background border ${errors.email ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary`} 
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Phone <span className="text-destructive">*</span></label>
                      <input 
                        id="phone" 
                        {...register("phone")} 
                        className={`w-full p-3 rounded-md bg-background border ${errors.phone ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary`} 
                      />
                      {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm font-medium text-muted-foreground">Company <span className="text-destructive">*</span></label>
                      <input 
                        id="company" 
                        {...register("company")} 
                        className={`w-full p-3 rounded-md bg-background border ${errors.company ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary`} 
                      />
                      {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold border-b border-border/40 pb-2 mb-6">Project Details</h3>
                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label htmlFor="service" className="text-sm font-medium text-muted-foreground">Service Required <span className="text-destructive">*</span></label>
                      <select 
                        id="service" 
                        {...register("service")} 
                        className={`w-full p-3 rounded-md bg-background border ${errors.service ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary`}
                      >
                        <option value="">Select a service...</option>
                        <option value="AI & Intelligence">AI & Intelligence</option>
                        <option value="Software Engineering">Software Engineering</option>
                        <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                        <option value="Data Engineering">Data Engineering</option>
                        <option value="Digital Transformation">Digital Transformation</option>
                        <option value="Enterprise Platforms">Enterprise Platforms</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.service && <p className="text-xs text-destructive">{errors.service.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="budget" className="text-sm font-medium text-muted-foreground">Estimated Budget</label>
                      <select 
                        id="budget" 
                        {...register("budget")} 
                        className="w-full p-3 rounded-md bg-background border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">Select range...</option>
                        <option value="< $50k">Less than $50,000</option>
                        <option value="$50k - $150k">$50,000 - $150,000</option>
                        <option value="$150k - $500k">$150,000 - $500,000</option>
                        <option value="$500k - $1M">$500,000 - $1M</option>
                        <option value="> $1M">More than $1M</option>
                        <option value="Not sure yet">Not sure yet</option>
                      </select>
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label htmlFor="timeline" className="text-sm font-medium text-muted-foreground">Expected Timeline</label>
                      <input 
                        id="timeline" 
                        {...register("timeline")} 
                        placeholder="e.g., Q3 2026 or 3-6 months"
                        className="w-full p-3 rounded-md bg-background border border-input focus:outline-none focus:ring-1 focus:ring-primary" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="requirements" className="text-sm font-medium text-muted-foreground">Project Requirements <span className="text-destructive">*</span></label>
                    <textarea 
                      id="requirements" 
                      rows={5}
                      {...register("requirements")} 
                      placeholder="Please describe your challenges and what you're trying to achieve..."
                      className={`w-full p-3 rounded-md bg-background border ${errors.requirements ? 'border-destructive' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary resize-none`} 
                    />
                    {errors.requirements && <p className="text-xs text-destructive">{errors.requirements.message}</p>}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-md bg-primary px-10 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                    ) : (
                      "Submit Request"
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestQuotePage;
