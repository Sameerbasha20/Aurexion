import React, { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { publicService } from "../../services/publicService";
import { ArrowUpRight, Loader2, CheckCircle2, AlertCircle, Mail, Phone, Building2 } from "lucide-react";
import { SEO } from "../../../../components/seo/SEO";
import { COUNTRY_CODES, validatePhoneNumber, clampPhoneNumber } from "../Contact/ContactPage";

const ESTIMATOR_STEPS = [
  {
    label: "STEP 01 / PROJECT SCOPE",
    question: "What type of system are you building?",
    options: [
      "Web Application",
      "Mobile App",
      "Enterprise Software / ERP",
      "CRM Platform",
      "AI / ML Platform",
      "Cloud Migration",
      "SaaS Product",
      "Digital Transformation"
    ],
  },
  {
    label: "STEP 02 / PLATFORM & SCALE",
    question: "How will the platform be deployed?",
    options: [
      "Multi-tenant SaaS",
      "Internal Enterprise Tool",
      "Consumer-Facing Platform",
      "Cross-Platform Mobile",
      "Hybrid Cloud",
      "On-Premise Enterprise"
    ],
  },
  {
    label: "STEP 03 / USER SCALE & INTEGRATIONS",
    question: "What is your target scale & integration complexity?",
    options: [
      "< 1,000 Users",
      "10,000+ Users",
      "100,000+ Users",
      "No 3rd-Party Integrations",
      "Standard REST APIs",
      "Complex Multi-System Integrations"
    ],
  },
  {
    label: "STEP 04 / SECURITY & COMPLIANCE",
    question: "What governance & compliance frameworks apply?",
    options: [
      "Standard Security",
      "SOC 2 Compliance",
      "HIPAA Compliance",
      "GDPR Compliance",
      "Government / Public Sector",
      "Multi-Framework Enterprise Compliance"
    ],
  },
];

const getBudgetRange = (selections: number[]): string => {
  const score = selections.reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
  if (score <= 4) return "$15,000 – $45,000";
  if (score <= 9) return "$45,000 – $120,000";
  if (score <= 14) return "$120,000 – $350,000";
  return "$350,000+";
};

const nameRegex = /^[a-zA-Z\s'-]+$/;

const followUpSchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .regex(nameRegex, "Please enter a valid name format (letters, spaces, hyphens, and apostrophes only)")
    .refine((val) => val.trim().length >= 2, "Please enter a valid full name"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Valid email is required")
    .refine((val) => !/^\d+@/.test(val), {
      message: "Email address username cannot be only numbers",
    }),
  countryCode: z.string(),
  phone: z.string(),
  company: z
    .string()
    .optional()
    .refine((val) => !val || !/^\d+$/.test(val.trim()), {
      message: "Company name cannot contain only numbers",
    })
    .refine((val) => !val || !/^(.)\1+$/.test(val.trim()), {
      message: "Company name cannot contain repeating characters",
    }),
  message: z.string().optional(),
}).superRefine((data, ctx) => {
  const phoneErr = validatePhoneNumber(data.phone || "", data.countryCode || "+1");
  if (phoneErr) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: phoneErr,
      path: ["phone"],
    });
  }
});

type FollowUpFormValues = z.infer<typeof followUpSchema>;

export const EstimatorPage: React.FC = () => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<(number | null)[]>([null, null, null, null]);
  const [done, setDone] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+1");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const currentCountry = COUNTRY_CODES.find((c) => c.code === selectedCountryCode) || COUNTRY_CODES[0];

  const { register, handleSubmit, setValue, formState: { errors }, reset: resetForm } = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpSchema),
    mode: "onChange",
    defaultValues: {
      countryCode: "+1",
      phone: "",
    }
  });

  const onFollowUpSubmit = async (data: FollowUpFormValues) => {
    setIsSubmittingFollowUp(true);
    setFollowUpError(null);

    const formattedPhone = selectedCountryCode === "+other"
      ? data.phone.trim()
      : `${selectedCountryCode} ${data.phone.replace(/\D/g, "")}`;

    try {
      await publicService.calculateEstimate({
        name: data.name,
        email: data.email,
        phone: formattedPhone,
        company: data.company || "",
        requirements: data.message || "Estimator follow-up request",
        estimatedCost: getBudgetRange(selections as number[]),
      });
      setFollowUpSubmitted(true);
      resetForm();
      setPhoneNumber("");
      setSelectedCountryCode("+1");
    } catch (err: any) {
      setFollowUpError(err.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const select = (optIdx: number) => {
    const updated = [...selections];
    updated[step] = optIdx;
    setSelections(updated);
  };

  const canAdvance = selections[step] !== null;

  const advance = () => {
    if (step < ESTIMATOR_STEPS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  const reset = () => {
    setStep(0);
    setSelections([null, null, null, null]);
    setDone(false);
  };

  return (
    <div style={{ background: "#050811", minHeight: "100vh", paddingTop: "6rem", paddingBottom: "6rem" }}>
      <SEO
        title="Interactive Software Project Budget Estimator | Aurexion"
        description="Calculate preliminary budget ranges and effort projections for web apps, SaaS platforms, cloud infrastructure, AI models, and custom ERP systems."
        canonical="/estimator"
      />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 max(4vw, 1.5rem)" }}>
        {/* Header */}
        <div style={{ marginBottom: "4rem", textAlign: "left" }}>
          <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8", marginBottom: "1.5rem" }}>
            PROJECT SCOPING / ESTIMATION ENGINE
          </p>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 500, letterSpacing: "-.065em", lineHeight: .9, margin: "0 0 1.5rem", color: "#eef4f3" }}>
            Estimate Your<br /><em style={{ fontStyle: "normal", color: "#b7c4c5" }}>Engineering Effort.</em>
          </h1>
          <p style={{ color: "#8da5ae", lineHeight: 1.7, maxWidth: "560px", fontSize: ".95rem" }}>
            Configure your technical scope, scale, and compliance parameters to receive an instant preliminary budget projection.
          </p>
        </div>

        {/* Wizard Container */}
        <div style={{ border: "1px solid rgba(99,245,232,.15)", background: "#060c18" }}>
          {!done ? (
            <>
              {ESTIMATOR_STEPS.map((s, i) => (
                <div key={i} className={`estimator-step ${i === step ? "active" : ""}`} style={{ display: i === step ? "block" : "none", padding: "2.5rem" }}>
                  <p className="estimator-step-label" style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".15em", color: "#63f5e8", marginBottom: "1rem" }}>
                    {s.label}
                  </p>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#eef4f3", letterSpacing: "-.03em", margin: "0 0 2rem" }}>
                    {s.question}
                  </h3>
                  <div className="estimator-options">
                    {s.options.map((opt, j) => (
                      <button type="button"
                        key={j}
                        className={`estimator-opt ${selections[i] === j ? "selected" : ""}`}
                        onClick={() => select(j)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Navigation */}
              <div className="estimator-nav" style={{ padding: "1.5rem 2.5rem", borderTop: "1px solid rgba(99,245,232,.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="estimator-progress" style={{ display: "flex", gap: ".5rem" }}>
                  {ESTIMATOR_STEPS.map((_, i) => (
                    <span key={i} className={`estimator-dot ${i <= step ? "active" : ""}`} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  {step > 0 && (
                    <button type="button" className="estimator-back" onClick={() => setStep(step - 1)}>
                      ← BACK
                    </button>
                  )}
                  <button type="button"
                    className="signal-button"
                    style={{ opacity: canAdvance ? 1 : 0.4, cursor: canAdvance ? "pointer" : "not-allowed" }}
                    disabled={!canAdvance}
                    onClick={advance}
                  >
                    {step === ESTIMATOR_STEPS.length - 1 ? "GET ESTIMATE" : "NEXT →"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="estimator-result" style={{ padding: "4rem 2.5rem" }}>
              <p className="estimator-result-label" style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8", marginBottom: ".8rem", textAlign: "center" }}>
                PRELIMINARY BUDGET PROJECTION
              </p>
              <h3 style={{ color: "#eef4f3", fontWeight: 500, fontSize: "1.8rem", margin: "0 0 1rem", textAlign: "center" }}>
                Estimated Engineering Effort
              </h3>
              <div className="estimator-result-range" style={{ fontSize: "3.5rem", fontWeight: 700, color: "#63f5e8", letterSpacing: "-.05em", margin: "1.5rem 0", textAlign: "center" }}>
                {getBudgetRange(selections as number[])}
              </div>
              <p style={{ color: "#8da5ae", fontSize: ".9rem", textAlign: "center" }}>
                Indicative budget range based on selected platform scope and architectural scale.
              </p>
              
              <div className="estimator-disclaimer" style={{ maxWidth: "600px", margin: "2rem auto", textAlign: "left", padding: "1.2rem 1.5rem", border: "1px solid rgba(99,245,232,.12)", background: "rgba(99,245,232,.02)", color: "#5e7079", fontSize: ".8rem", lineHeight: 1.6 }}>
                <strong style={{ color: "#eef4f3" }}>Legal Disclaimer: </strong>
                This estimate represents a preliminary requirement sizing estimate and does not constitute a binding contract, quotation, or financial commitment. Final pricing and timelines are determined through formal architecture discovery and official statement of work (SOW) issuance by Aurexion Technologies.
              </div>

              <div className="estimator-result-ctas" style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2.5rem", flexWrap: "wrap" }}>
                <Link href="/rfp" className="signal-button inline-flex items-center gap-2">
                  SUBMIT FORMAL RFP <ArrowUpRight size={16} />
                </Link>
                <button type="button" className="text-button" onClick={reset}>
                  RECALCULATE ESTIMATE
                </button>
                <button type="button" 
                  className="outline-button inline-flex items-center gap-2" 
                  onClick={() => setShowFollowUp(true)}
                  style={{ background: "transparent", border: "1px solid rgba(99,245,232,.3)", color: "#63f5e8" }}
                >
                  <Mail size={16} /> REQUEST FOLLOW-UP
                </button>
              </div>

              {/* Follow-up Form */}
              {showFollowUp && !followUpSubmitted && (
                <div style={{ maxWidth: "500px", margin: "3rem auto 0", textAlign: "left" }}>
                  <div style={{ border: "1px solid rgba(99,245,232,.15)", background: "#060c18", borderRadius: "8px", padding: "2rem" }}>
                    <h4 style={{ color: "#eef4f3", fontWeight: 500, fontSize: "1.2rem", margin: "0 0 0.5rem", textAlign: "center" }}>
                      Request Follow-up from BDM
                    </h4>
                    <p style={{ color: "#8da5ae", fontSize: ".85rem", textAlign: "center", marginBottom: "1.5rem" }}>
                      Our Business Development Manager will contact you within 24 hours to discuss your project.
                    </p>
                    
                    {followUpError && (
                      <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)", display: "flex", gap: ".75rem", alignItems: "flex-start", borderRadius: "4px" }}>
                        <AlertCircle style={{ width: 16, height: 16, color: "#f87171", flexShrink: 0, marginTop: 2 }} />
                        <p style={{ color: "#f87171", fontSize: ".82rem", margin: 0 }}>{followUpError}</p>
                      </div>
                    )}
                    <form onSubmit={handleSubmit(onFollowUpSubmit)} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                         <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                           <label style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".1em", color: "#63f5e8", textTransform: "uppercase" }}>
                             Name *
                           </label>
                           <input 
                             {...register("name")} 
                             type="text"
                             placeholder="Enter your full name"
                             style={{ padding: "0.75rem 1rem", background: "#050811", border: "1px solid rgba(99,245,232,.2)", color: "#eef4f3", borderRadius: "4px", fontFamily: "inherit", fontSize: ".875rem" }}
                           />
                           {errors.name && <p style={{ color: "#f87171", fontSize: ".75rem", fontFamily: "'IBM Plex Mono'" }}>{errors.name.message}</p>}
                         </div>
                         <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                           <label style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".1em", color: "#63f5e8", textTransform: "uppercase" }}>
                             Email *
                           </label>
                           <input 
                             {...register("email")} 
                             type="email"
                             placeholder="Enter your email"
                             style={{ padding: "0.75rem 1rem", background: "#050811", border: "1px solid rgba(99,245,232,.2)", color: "#eef4f3", borderRadius: "4px", fontFamily: "inherit", fontSize: ".875rem" }}
                           />
                           {errors.email && <p style={{ color: "#f87171", fontSize: ".75rem", fontFamily: "'IBM Plex Mono'" }}>{errors.email.message}</p>}
                         </div>
                       </div>
                       
                       <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".1em", color: "#63f5e8", textTransform: "uppercase" }}>
                              Phone *
                            </label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <select
                                id="countryCode"
                                value={selectedCountryCode}
                                onChange={(e) => {
                                  const newCode = e.target.value;
                                  setSelectedCountryCode(newCode);
                                  setValue("countryCode", newCode, { shouldValidate: true });
                                  const clamped = clampPhoneNumber(phoneNumber, newCode);
                                  setPhoneNumber(clamped);
                                  setValue("phone", clamped, { shouldValidate: true });
                                }}
                                style={{
                                  padding: "0.75rem 0.5rem",
                                  background: "#050811",
                                  border: "1px solid rgba(99,245,232,.2)",
                                  color: "#eef4f3",
                                  borderRadius: "4px",
                                  fontFamily: "inherit",
                                  fontSize: ".875rem",
                                  minWidth: "90px",
                                  maxWidth: "110px",
                                  cursor: "pointer",
                                }}
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <option key={c.code} value={c.code} style={{ backgroundColor: "#050811", color: "#eef4f3" }}>
                                    {c.flag} {c.code}
                                  </option>
                                ))}
                              </select>
                              <div style={{ flex: 1 }}>
                                <input 
                                  id="phone" 
                                  type="tel"
                                  value={phoneNumber}
                                  maxLength={currentCountry.digitsMax}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/\D/g, "");
                                    const clamped = raw.slice(0, currentCountry.digitsMax);
                                    setPhoneNumber(clamped);
                                    setValue("phone", clamped, { shouldValidate: true });
                                  }}
                                  placeholder="Enter phone number"
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem 1rem",
                                    background: "#050811",
                                    border: "1px solid rgba(99,245,232,.2)",
                                    color: "#eef4f3",
                                    borderRadius: "4px",
                                    fontFamily: "monospace",
                                    fontSize: ".875rem",
                                  }}
                                />
                              </div>
                            </div>
                            {errors.phone && <p style={{ color: "#f87171", fontSize: ".75rem", fontFamily: "'IBM Plex Mono'" }}>{errors.phone.message}</p>}
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".1em", color: "#63f5e8", textTransform: "uppercase" }}>
                              Company
                            </label>
                            <input 
                              {...register("company")} 
                              type="text"
                              placeholder="Enter company name"
                              style={{ padding: "0.75rem 1rem", background: "#050811", border: "1px solid rgba(99,245,232,.2)", color: "#eef4f3", borderRadius: "4px", fontFamily: "inherit", fontSize: ".875rem" }}
                            />
                            {errors.company && <p style={{ color: "#f87171", fontSize: ".75rem", fontFamily: "'IBM Plex Mono'" }}>{errors.company.message}</p>}
                          </div>
                        </div>
 
                       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                         <label style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".1em", color: "#63f5e8", textTransform: "uppercase" }}>
                           Message (Optional)
                         </label>
                         <textarea 
                           {...register("message")} 
                           rows={3}
                           placeholder="Enter project details"
                           style={{ padding: "0.75rem 1rem", background: "#050811", border: "1px solid rgba(99,245,232,.2)", color: "#eef4f3", borderRadius: "4px", fontFamily: "inherit", fontSize: ".875rem", resize: "vertical" }}
                         />
                       </div>

                      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                        <button 
                          type="submit" 
                          disabled={isSubmittingFollowUp}
                          style={{ 
                            flex: 1, 
                            padding: "0.875rem", 
                            background: "#63f5e8", 
                            border: "1px solid #63f5e8", 
                            color: "#041014", 
                            fontFamily: "'IBM Plex Mono'", 
                            fontSize: ".68rem", 
                            fontWeight: 700, 
                            letterSpacing: ".1em", 
                            cursor: isSubmittingFollowUp ? "wait" : "pointer",
                            opacity: isSubmittingFollowUp ? 0.7 : 1,
                            borderRadius: "4px"
                          }}
                        >
                          {isSubmittingFollowUp ? (
                            <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite", display: "inline-block" }} /> SUBMITTING...</>
                          ) : (
                            "SUBMIT REQUEST"
                          )}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => { setShowFollowUp(false); setFollowUpError(null); }}
                          style={{ 
                            flex: 1, 
                            padding: "0.875rem", 
                            background: "transparent", 
                            border: "1px solid rgba(99,245,232,.3)", 
                            color: "#63f5e8", 
                            fontFamily: "'IBM Plex Mono'", 
                            fontSize: ".68rem", 
                            fontWeight: 700, 
                            letterSpacing: ".1em", 
                            cursor: "pointer",
                            borderRadius: "4px"
                          }}
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {followUpSubmitted && (
                <div style={{ maxWidth: "500px", margin: "3rem auto 0", textAlign: "center" }}>
                  <div style={{ border: "1px solid rgba(99,245,232,.25)", background: "rgba(99,245,232,.05)", borderRadius: "8px", padding: "3rem 2rem" }}>
                    <CheckCircle2 style={{ width: 56, height: 56, color: "#63f5e8", margin: "0 auto 1.5rem" }} />
                    <h4 style={{ color: "#eef4f3", fontWeight: 500, fontSize: "1.5rem", margin: "0 0 1rem" }}>
                      Request Submitted
                    </h4>
                    <p style={{ color: "#8da5ae", marginBottom: "2rem", fontSize: ".9rem", lineHeight: 1.6 }}>
                      Our Business Development Manager will review your estimate and contact you within 24 hours.
                    </p>
                    <button type="button"
                      onClick={() => { setFollowUpSubmitted(false); setShowFollowUp(false); resetForm(); }}
                      style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".1em", color: "#63f5e8", background: "none", border: "none", cursor: "pointer" }}
                    >
                      SUBMIT ANOTHER REQUEST
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstimatorPage;
