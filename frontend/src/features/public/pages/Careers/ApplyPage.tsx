import React, { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useJobDetails } from "../../hooks/usePublicContent";
import { publicService } from "../../services/publicService";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { SEO } from "../../../../components/seo/SEO";

interface CountryCodeOption {
  code: string;
  name: string;
  flag: string;
  digitsMin: number;
  digitsMax: number;
  placeholder: string;
}

const COUNTRY_CODES: CountryCodeOption[] = [
  { code: "+1", name: "United States / Canada", flag: "🇺🇸", digitsMin: 10, digitsMax: 10, placeholder: "555 123 4567" },
  { code: "+91", name: "India", flag: "🇮🇳", digitsMin: 10, digitsMax: 10, placeholder: "98765 43210" },
  { code: "+44", name: "United Kingdom", flag: "🇬🇧", digitsMin: 10, digitsMax: 11, placeholder: "7911 123456" },
  { code: "+61", name: "Australia", flag: "🇦🇺", digitsMin: 9, digitsMax: 9, placeholder: "412 345 678" },
  { code: "+971", name: "UAE", flag: "🇦🇪", digitsMin: 9, digitsMax: 9, placeholder: "50 123 4567" },
  { code: "+65", name: "Singapore", flag: "🇸🇬", digitsMin: 8, digitsMax: 8, placeholder: "8123 4567" },
  { code: "+49", name: "Germany", flag: "🇩🇪", digitsMin: 10, digitsMax: 11, placeholder: "151 12345678" },
  { code: "+33", name: "France", flag: "🇫🇷", digitsMin: 9, digitsMax: 9, placeholder: "6 12 34 56 78" },
  { code: "+81", name: "Japan", flag: "🇯🇵", digitsMin: 10, digitsMax: 10, placeholder: "90 1234 5678" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭", digitsMin: 9, digitsMax: 9, placeholder: "78 123 45 67" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦", digitsMin: 9, digitsMax: 9, placeholder: "50 123 4567" },
  { code: "+86", name: "China", flag: "🇨🇳", digitsMin: 11, digitsMax: 11, placeholder: "138 1234 5678" },
  { code: "+353", name: "Ireland", flag: "🇮🇪", digitsMin: 9, digitsMax: 9, placeholder: "87 123 4567" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱", digitsMin: 9, digitsMax: 9, placeholder: "6 12345678" },
  { code: "+other", name: "Other (International)", flag: "🌐", digitsMin: 7, digitsMax: 15, placeholder: "Enter complete phone number" },
];

export const validatePhoneNumber = (phone: string, countryCode: string): string => {
  const rawDigits = phone.replace(/\D/g, "");
  const country = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  if (!rawDigits) {
    return "Phone number is required";
  }

  if (country.code === "+other") {
    if (rawDigits.length < 7 || rawDigits.length > 15) {
      return "Please enter a valid international phone number (7 to 15 digits)";
    }
    return "";
  }

  if (country.digitsMin === country.digitsMax) {
    if (rawDigits.length !== country.digitsMin) {
      return `${country.name} phone number must be exactly ${country.digitsMin} digits (${rawDigits.length}/${country.digitsMin})`;
    }
  } else {
    if (rawDigits.length < country.digitsMin || rawDigits.length > country.digitsMax) {
      return `${country.name} phone number must be between ${country.digitsMin} and ${country.digitsMax} digits (${rawDigits.length} entered)`;
    }
  }

  return "";
};

export const clampPhoneNumber = (phone: string, countryCode: string): string => {
  const raw = phone.replace(/\D/g, "");
  const country = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];
  return raw.slice(0, country.digitsMax);
};

export const validateResumeFile = (file: File): { isValid: boolean; error: string } => {
  const fileName = file.name.toLowerCase();
  const validExtensions = [".pdf", ".doc", ".docx"];
  const isValidExtension = validExtensions.some((ext) => fileName.endsWith(ext));

  if (!isValidExtension) {
    return {
      isValid: false,
      error: "Invalid file format. Only PDF and Word documents (.pdf, .doc, .docx) are accepted.",
    };
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size (${sizeMb} MB) exceeds the 5MB maximum limit. Please upload a smaller file.`,
    };
  }

  return { isValid: true, error: "" };
};

const nameRegex = /^[a-zA-Z\s'-]+$/;

const applySchema = z.object({
  name: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .regex(nameRegex, "Please enter a valid name format (letters, spaces, hyphens, and apostrophes only)")
    .refine((val) => val.trim().length >= 2, "Please enter a valid full name"),
  email: z.string().email("Valid email address is required"),
  coverLetter: z.string().optional(),
});

type ApplyFormValues = z.infer<typeof applySchema>;

export const ApplyPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const { data: job, loading: jobLoading, error: jobError } = useJobDetails(id);
  const [, setLocation] = useLocation();
  
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Country code & Phone Number State
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+91");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const currentCountry = COUNTRY_CODES.find((c) => c.code === selectedCountryCode) || COUNTRY_CODES[0];

  const { register, handleSubmit, formState: { errors } } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema)
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clampedDigits = clampPhoneNumber(e.target.value, selectedCountryCode);
    setPhoneNumber(clampedDigits);
    setPhoneError(clampedDigits.length > 0 ? validatePhoneNumber(clampedDigits, selectedCountryCode) : "");
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCountryCode(newCode);
    const clampedDigits = clampPhoneNumber(phoneNumber, newCode);
    setPhoneNumber(clampedDigits);
    setPhoneError(clampedDigits.length > 0 ? validatePhoneNumber(clampedDigits, newCode) : "");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validation = validateResumeFile(selectedFile);
      if (!validation.isValid) {
        setFileError(validation.error);
        setFile(null);
      } else {
        setFileError("");
        setFile(selectedFile);
      }
    }
  };

  const onSubmit = async (data: ApplyFormValues) => {
    const pError = validatePhoneNumber(phoneNumber, selectedCountryCode);
    if (pError) {
      setPhoneError(pError);
    }

    if (!file) {
      setFileError("Resume file is required (PDF or Word document)");
    }

    if (pError || !file) {
      return;
    }

    setPhoneError("");
    setFileError("");
    setIsSubmitting(true);
    setSubmitError(null);

    const rawDigits = phoneNumber.replace(/\D/g, "");
    const formattedPhone = selectedCountryCode === "+other"
      ? phoneNumber.trim()
      : `${selectedCountryCode} ${rawDigits}`;
    
    try {
      await publicService.applyForJob({
        jobId: id,
        name: data.name,
        email: data.email,
        phone: formattedPhone,
        coverLetter: data.coverLetter,
        resume: file,
      });
      setSuccess(true);
    } catch (err: any) {
      const res = err.response?.data;
      let errorMsg = "Failed to submit application. Please check your details and try again.";
      
      if (typeof res === "string") {
        errorMsg = res;
      } else if (res?.message) {
        errorMsg = res.message;
      } else if (res?.detail) {
        errorMsg = res.detail;
      } else if (res && typeof res === "object") {
        const errorList: string[] = [];
        for (const [key, value] of Object.entries(res)) {
          const formattedKey = key.replace(/_/g, " ").toUpperCase();
          const valMsg = Array.isArray(value) ? value.join(", ") : String(value);
          errorList.push(`${formattedKey}: ${valMsg}`);
        }
        if (errorList.length > 0) {
          errorMsg = errorList.join(" | ");
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (jobLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
        <Link href="/careers" className="text-primary hover:underline flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Careers
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-background pt-24 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
          <div className="bg-card border border-border/40 rounded-lg p-12 flex flex-col items-center">
            <CheckCircle2 className="h-16 w-16 text-primary mb-6" />
            <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for applying for the <strong>{job.title}</strong> position. Our team will review your application and get back to you shortly.
            </p>
            <Link href="/careers" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Return to Careers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background pt-32 sm:pt-36 pb-24">
      <SEO
        title={`Apply: ${job.title} | Careers`}
        description={`Submit application for the ${job.title} position at Aurexion Technologies.`}
        noindex={true}
        nofollow={true}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <Link href={`/careers/${id}`} className="inline-flex items-center text-sm font-mono text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> BACK TO JOB DESCRIPTION
        </Link>
        
        <div className="mb-10">
          <h1 
            style={{ 
              fontSize: "clamp(1.85rem, 3.2vw, 2.35rem)", 
              lineHeight: "1.25", 
              fontWeight: 700, 
              letterSpacing: "-0.015em", 
              margin: "0.25rem 0 0.75rem",
              color: "#f8fafc",
              maxWidth: "100%" 
            }}
          >
            Apply for {job.title}
          </h1>
          <p className="text-muted-foreground">Please fill out the form below to submit your application.</p>
        </div>

        {submitError && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <p>{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input 
                id="name" 
                {...register("name")} 
                className="w-full p-3 rounded-md bg-background focus:outline-none transition-colors"
                style={{
                  border: errors.name ? "1px solid #ef4444" : "1px solid #1e293b",
                  boxShadow: errors.name ? "0 0 0 1px rgba(239, 68, 68, 0.25)" : undefined,
                }} 
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p style={{ color: "#ef4444", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.35rem", fontFamily: "IBM Plex Mono, monospace" }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input 
                id="email" 
                type="email"
                {...register("email")} 
                className="w-full p-3 rounded-md bg-background focus:outline-none transition-colors"
                style={{
                  border: errors.email ? "1px solid #ef4444" : "1px solid #1e293b",
                  boxShadow: errors.email ? "0 0 0 1px rgba(239, 68, 68, 0.25)" : undefined,
                }} 
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p style={{ color: "#ef4444", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.35rem", fontFamily: "IBM Plex Mono, monospace" }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Country Code & Phone Number Field */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium">
              Phone Number <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedCountryCode}
                onChange={handleCountryChange}
                className="p-3 rounded-md bg-background focus:outline-none transition-colors cursor-pointer text-sm font-medium"
                style={{
                  border: "1px solid #1e293b",
                  minWidth: "160px",
                  color: "#f8fafc",
                  backgroundColor: "#050811",
                }}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code} style={{ backgroundColor: "#050811", color: "#f8fafc" }}>
                    {c.flag} {c.code} ({c.name.split(" / ")[0].split(" ")[0]})
                  </option>
                ))}
              </select>

              <input 
                id="phone" 
                type="tel"
                value={phoneNumber}
                maxLength={currentCountry.digitsMax}
                onChange={handlePhoneChange}
                className="w-full p-3 rounded-md bg-background focus:outline-none transition-colors font-mono"
                style={{
                  border: phoneError ? "1px solid #ef4444" : "1px solid #1e293b",
                  boxShadow: phoneError ? "0 0 0 1px rgba(239, 68, 68, 0.25)" : undefined,
                }} 
                placeholder={currentCountry.placeholder}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.35rem" }}>
              {phoneError ? (
                <p style={{ color: "#ef4444", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem", margin: 0, fontFamily: "IBM Plex Mono, monospace" }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{phoneError}</span>
                </p>
              ) : (
                <span />
              )}
              {phoneNumber.length > 0 && (
                <span style={{ fontSize: "0.75rem", color: phoneError ? "#ef4444" : "#64748b", fontFamily: "IBM Plex Mono, monospace", marginLeft: "auto" }}>
                  {phoneNumber.length} / {currentCountry.digitsMax} digits
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="resume" className="text-sm font-medium">
              Resume (PDF, Word) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input 
              id="resume" 
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="w-full p-3 rounded-md bg-background focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              style={{
                border: fileError ? "1px solid #ef4444" : "1px solid #1e293b",
                boxShadow: fileError ? "0 0 0 1px rgba(239, 68, 68, 0.25)" : undefined,
              }} 
            />
            {fileError && (
              <p style={{ color: "#ef4444", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.35rem", fontFamily: "IBM Plex Mono, monospace" }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{fileError}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="coverLetter" className="text-sm font-medium">Cover Letter (Optional)</label>
            <textarea 
              id="coverLetter" 
              rows={6}
              {...register("coverLetter")} 
              className="w-full p-3 rounded-md bg-background focus:outline-none resize-none"
              style={{ border: "1px solid #1e293b" }}
            />
          </div>

          <div className="pt-4 border-t border-border/40">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;
