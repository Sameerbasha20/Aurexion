import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { publicService } from "../../services/publicService";
import { CheckCircle2, Loader2, AlertCircle, Upload } from "lucide-react";
import { SEO } from "../../../../components/seo/SEO";
import { COUNTRY_CODES, validatePhoneNumber, clampPhoneNumber } from "../Contact/ContactPage";

const COUNTRIES = [
  "United States", "United Kingdom", "India", "Canada", "Australia", "Germany",
  "France", "Singapore", "UAE", "Saudi Arabia", "Netherlands", "Japan",
  "South Korea", "Brazil", "South Africa", "Other"
];

const PROJECT_TYPES = [
  "Web Application", "Mobile Application", "Enterprise Software / ERP",
  "CRM Platform", "AI / ML Platform", "Cloud Migration",
  "SaaS Product Engineering", "Digital Transformation", "Cybersecurity",
  "Data Engineering / BI", "UI/UX Engineering", "Other"
];

const BUDGET_RANGES = [
  "Below $25,000", "$25,000 – $75,000", "$75,000 – $200,000",
  "$200,000 – $500,000", "$500,000+", "To be discussed"
];

// Generate AUR-RFP-YYYY-XXXXX reference securely
const generateRef = () => {
  const year = new Date().getFullYear();
  let seqNum = 10000;
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    seqNum = (array[0] % 90000) + 10000;
  }
  return `AUR-RFP-${year}-${seqNum}`;
};

const nameRegex = /^[a-zA-Z\s'-]+$/;

const rfpSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .regex(nameRegex, "Please enter a valid name format (letters, spaces, hyphens, and apostrophes only)")
    .refine((val) => val.trim().length >= 2, "Please enter a valid full name"),
  company_name: z
    .string()
    .min(2, "Company name is required")
    .refine((val) => !/^\d+$/.test(val.trim()), {
      message: "Company name cannot contain only numbers",
    })
    .refine((val) => !/^(.)\1+$/.test(val.trim()), {
      message: "Company name cannot contain repeating characters",
    }),
  work_email: z
    .string()
    .trim()
    .min(1, "Work email is required")
    .email("Valid work email is required")
    .refine((val) => !/^\d+@/.test(val), {
      message: "Work email address username cannot be only numbers",
    }),
  countryCode: z.string(),
  phone: z.string(),
  designation: z
    .string()
    .min(2, "Designation / job title is required")
    .refine((val) => !/^\d+$/.test(val.trim()), {
      message: "Designation / job title cannot contain only numbers",
    })
    .refine((val) => !/^(.)\1+$/.test(val.trim()), {
      message: "Designation / job title cannot contain repeating characters",
    }),
  country: z
    .string()
    .min(1, "Please select your country")
    .refine((val) => COUNTRIES.includes(val), "Please select a valid country from the dropdown"),
  project_type: z
    .string()
    .min(1, "Please select a project type")
    .refine((val) => PROJECT_TYPES.includes(val), "Please select a valid project type"),
  budget_range: z
    .string()
    .min(1, "Please select a budget range")
    .refine((val) => BUDGET_RANGES.includes(val), "Please select a valid budget range"),
  project_description: z.string().min(50, "Please provide at least 50 characters describing your project"),
  nda_required: z.boolean().optional(),
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

type RfpFormValues = z.infer<typeof rfpSchema>;

export const RfpPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+1");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const currentCountry = COUNTRY_CODES.find((c) => c.code === selectedCountryCode) || COUNTRY_CODES[0];

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<RfpFormValues>({
    resolver: zodResolver(rfpSchema),
    mode: "onChange",
    defaultValues: {
      nda_required: false,
      countryCode: "+1",
      phone: "",
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "application/x-zip-compressed"];
    if (!allowed.includes(f.type)) {
      setFileError("Only PDF, DOCX, or ZIP files are accepted.");
      setFile(null);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setFileError("File size must not exceed 10MB.");
      setFile(null);
      return;
    }
    setFileError(null);
    setFile(f);
  };

  const onSubmit = async (data: RfpFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    const formattedPhone = selectedCountryCode === "+other"
      ? data.phone.trim()
      : `${selectedCountryCode} ${data.phone.replace(/\D/g, "")}`;

    try {
      await publicService.submitRfp({ ...data, phone: formattedPhone, file });
      const ref = generateRef();
      setRefCode(ref);
      setSuccess(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit RFP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = "w-full p-3 rounded-none bg-[#060c18] border border-[rgba(99,245,232,.2)] text-[#eef4f3] placeholder-[#5a6b72] focus:outline-none focus:border-[#63f5e8] font-['Space_Grotesk'] text-sm transition-colors";
  const labelClass = "flex items-center gap-1 text-xs font-mono tracking-widest text-[#63f5e8] mb-1.5 uppercase flex-wrap";
  const errorClass = "text-xs text-red-400 mt-1 font-mono";

  return (
    <div style={{ background: "#050811", minHeight: "100vh", paddingTop: "6rem", paddingBottom: "6rem" }}>
      <SEO
        title="Submit a Formal RFP | Aurexion Technologies"
        description="Submit your enterprise project requirements securely for technical scope evaluation, architecture review, and formal commercial proposal."
        canonical="/rfp"
      />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 max(4vw, 1.5rem)" }}>

        {/* Header */}
        <div style={{ marginBottom: "4rem" }}>
          <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8", marginBottom: "1.5rem" }}>
            SUBMIT RFP / REQUEST FOR PROPOSAL
          </p>
          <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 500, letterSpacing: "-.065em", lineHeight: .9, margin: "0 0 1.5rem", color: "#eef4f3" }}>
            Request for<br /><em style={{ fontStyle: "normal", color: "#b7c4c5" }}>Proposal.</em>
          </h1>
          <p style={{ color: "#8da5ae", lineHeight: 1.7, maxWidth: "560px", fontSize: ".95rem" }}>
            Submit your project requirements securely. Our engineering and strategy team will review and respond with a comprehensive technical proposal.
          </p>
        </div>

        {/* Form Card */}
        <div style={{ border: "1px solid rgba(99,245,232,.15)", background: "#060c18" }}>
          {success ? (
            <div style={{ padding: "4rem 2.5rem", textAlign: "center" }}>
              <CheckCircle2 style={{ width: 56, height: 56, color: "#63f5e8", margin: "0 auto 1.5rem" }} />
              <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8", marginBottom: ".8rem" }}>RFP SUBMITTED SUCCESSFULLY</p>
              <h2 style={{ color: "#eef4f3", fontWeight: 500, letterSpacing: "-.04em", fontSize: "1.8rem", margin: "0 0 1rem" }}>Your RFP has been received.</h2>
              <p style={{ color: "#8da5ae", marginBottom: "2rem", fontSize: ".9rem", lineHeight: 1.6, maxWidth: "480px", margin: "0 auto 2rem" }}>
                Our team will review your submission and respond within 24–48 business hours.
              </p>
              {/* Reference Code */}
              <div style={{ border: "1px solid rgba(99,245,232,.25)", background: "rgba(99,245,232,.05)", padding: "1.5rem 2rem", margin: "0 auto 2rem", maxWidth: "400px" }}>
                <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".58rem", letterSpacing: ".15em", color: "#63f5e8", marginBottom: ".5rem" }}>YOUR REFERENCE NUMBER</p>
                <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: "1.3rem", color: "#eef4f3", fontWeight: 600, letterSpacing: ".08em", margin: 0 }}>{refCode}</p>
                <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".6rem", color: "#5a6b72", marginTop: ".5rem" }}>Please save this for your records</p>
              </div>
              <button type="button"
                onClick={() => {
                  setSuccess(false);
                  reset();
                  setFile(null);
                  setCharCount(0);
                  setPhoneNumber("");
                  setSelectedCountryCode("+1");
                }}
                style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".1em", color: "#63f5e8", background: "none", border: "none", cursor: "pointer" }}
              >
                ← SUBMIT ANOTHER RFP
              </button>
            </div>
          ) : (
            <>
              {submitError && (
                <div style={{ margin: "0 2.5rem", marginTop: "2rem", padding: "1rem 1.2rem", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.25)", display: "flex", gap: ".75rem", alignItems: "flex-start" }}>
                  <AlertCircle style={{ width: 16, height: 16, color: "#f87171", flexShrink: 0, marginTop: 2 }} />
                  <p style={{ color: "#f87171", fontSize: ".82rem", margin: 0 }}>{submitError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} style={{ padding: "clamp(1.25rem, 5vw, 2.5rem)" }}>
                {/* Row 1: Full Name + Company */}
                <div className="rfp-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label className={labelClass}>Full Name <span style={{ color: "#63f5e8" }}>*</span></label>
                    <input {...register("full_name")} className={fieldClass} placeholder="Enter your full name" />
                    {errors.full_name && <p className={errorClass}>{errors.full_name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Company Name <span style={{ color: "#63f5e8" }}>*</span></label>
                    <input {...register("company_name")} className={fieldClass} placeholder="Enter your company name" />
                    {errors.company_name && <p className={errorClass}>{errors.company_name.message}</p>}
                  </div>
                </div>

                {/* Row 2: Work Email + Phone */}
                <div className="rfp-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label className={labelClass}>Work Email <span style={{ color: "#63f5e8" }}>*</span></label>
                    <input {...register("work_email")} type="email" className={fieldClass} placeholder="Enter your work email" />
                    {errors.work_email && <p className={errorClass}>{errors.work_email.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number <span style={{ color: "#63f5e8" }}>*</span></label>
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
                        className={fieldClass}
                        style={{
                          backgroundColor: "#050811",
                          color: "#f8fafc",
                          border: "1px solid rgba(99,245,232,.2)",
                          minWidth: "90px",
                          maxWidth: "110px",
                          cursor: "pointer",
                        }}
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code} style={{ backgroundColor: "#050811", color: "#f8fafc" }}>
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
                          className={`${fieldClass} font-mono placeholder:font-sans`} 
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                  </div>
                </div>

                {/* Row 3: Designation + Country */}
                <div className="rfp-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label className={labelClass}>Designation / Job Title <span style={{ color: "#63f5e8" }}>*</span></label>
                    <input {...register("designation")} className={fieldClass} placeholder="Enter your designation / job title" />
                    {errors.designation && <p className={errorClass}>{errors.designation.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Country <span style={{ color: "#63f5e8" }}>*</span></label>
                    <select {...register("country")} className={fieldClass} style={{ cursor: "pointer" }}>
                      <option value="">Select country...</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.country && <p className={errorClass}>{errors.country.message}</p>}
                  </div>
                </div>

                {/* Row 4: Project Type + Budget */}
                <div className="rfp-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <label className={labelClass}>Project Type <span style={{ color: "#63f5e8" }}>*</span></label>
                    <select {...register("project_type")} className={fieldClass} style={{ cursor: "pointer" }}>
                      <option value="">Select project type...</option>
                      {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {errors.project_type && <p className={errorClass}>{errors.project_type.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Budget Range <span style={{ color: "#63f5e8" }}>*</span></label>
                    <select {...register("budget_range")} className={fieldClass} style={{ cursor: "pointer" }}>
                      <option value="">Select budget range...</option>
                      {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {errors.budget_range && <p className={errorClass}>{errors.budget_range.message}</p>}
                  </div>
                </div>

                {/* Project Description */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label className={labelClass}>
                    Project Description * <span style={{ color: "#5a6b72", fontWeight: 400 }}>({charCount}/50 min chars)</span>
                  </label>
                  <textarea
                    {...register("project_description")}
                    rows={5}
                    className={fieldClass}
                    onChange={(e) => setCharCount(e.target.value.length)}
                    style={{ resize: "vertical" }}
                  />
                  {errors.project_description && <p className={errorClass}>{errors.project_description.message}</p>}
                </div>

                {/* File Upload */}
                <div style={{ marginBottom: "1.5rem", borderTop: "1px solid rgba(99,245,232,.1)", paddingTop: "1.5rem" }}>
                  <label className={labelClass}>Upload RFP Documents (Optional)</label>
                  <label style={{ display: "flex", alignItems: "center", gap: "1rem", border: "1px dashed rgba(99,245,232,.25)", padding: "1.2rem 1.5rem", cursor: "pointer", background: "rgba(99,245,232,.02)", transition: "border-color .18s" }}>
                    <Upload size={18} style={{ color: "#63f5e8", flexShrink: 0 }} />
                    <div>
                      <p style={{ color: "#eef4f3", fontSize: ".85rem", margin: "0 0 .2rem" }}>
                        {file ? file.name : "Click to upload or drag & drop"}
                      </p>
                      <p style={{ color: "#5a6b72", fontSize: ".72rem", fontFamily: "'IBM Plex Mono'", margin: 0 }}>
                        PDF, DOCX, ZIP — Max 10MB
                      </p>
                    </div>
                    <input type="file" style={{ display: "none" }} accept=".pdf,.docx,.zip" onChange={handleFileChange} />
                  </label>
                  {fileError && <p className={errorClass}>{fileError}</p>}
                  {file && !fileError && (
                    <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", color: "#63f5e8", marginTop: ".5rem", letterSpacing: ".08em" }}>
                      ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {/* NDA Checkbox */}
                <div style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-start", gap: ".9rem" }}>
                  <input
                    {...register("nda_required")}
                    type="checkbox"
                    id="nda_required"
                    style={{ width: 16, height: 16, accentColor: "#63f5e8", marginTop: 2, flexShrink: 0, cursor: "pointer" }}
                  />
                  <label htmlFor="nda_required" style={{ fontSize: ".82rem", color: "#8da5ae", cursor: "pointer", lineHeight: 1.5 }}>
                    <strong style={{ color: "#eef4f3" }}>NDA Required:</strong> I require a signed Non-Disclosure Agreement (NDA) prior to sharing detailed project information with Aurexion Technologies.
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ width: "100%", padding: "1rem", background: "#63f5e8", border: "1px solid #63f5e8", color: "#041014", fontFamily: "'IBM Plex Mono'", fontSize: ".68rem", fontWeight: 700, letterSpacing: ".1em", cursor: isSubmitting ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: ".6rem", opacity: isSubmitting ? .7 : 1, transition: "background .18s, box-shadow .2s" }}
                >
                  {isSubmitting
                    ? <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> SUBMITTING...</>
                    : "SUBMIT FORMAL RFP"}
                </button>

                <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".6rem", color: "#4a5b62", textAlign: "center", marginTop: "1rem", lineHeight: 1.6 }}>
                  Your submission is confidential. All data is handled in accordance with our Privacy Policy. A tracking reference will be generated upon successful submission.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RfpPage;
