import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "wouter";
import { publicService } from "../../services/publicService";
import { Mail, Phone, MapPin, Clock, CheckCircle2, Loader2, AlertCircle, LifeBuoy } from "lucide-react";
import { SEO } from "../../../../components/seo/SEO";

interface CountryCodeOption {
  code: string;
  name: string;
  flag: string;
  digitsMin: number;
  digitsMax: number;
  placeholder: string;
}

export const COUNTRY_CODES: CountryCodeOption[] = [
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
    return "Phone number is required.";
  }

  if (country.code === "+other") {
    if (rawDigits.length < 7 || rawDigits.length > 15) {
      return "Please enter a valid international phone number (7 to 15 digits).";
    }
    return "";
  }

  if (country.digitsMin === country.digitsMax) {
    if (rawDigits.length !== country.digitsMin) {
      return `${country.name} phone number must be exactly ${country.digitsMin} digits (${rawDigits.length}/${country.digitsMin}).`;
    }
  } else {
    if (rawDigits.length < country.digitsMin || rawDigits.length > country.digitsMax) {
      return `${country.name} phone number must be between ${country.digitsMin} and ${country.digitsMax} digits (${rawDigits.length} entered).`;
    }
  }

  return "";
};

export const clampPhoneNumber = (phone: string, countryCode: string): string => {
  const raw = phone.replace(/\D/g, "");
  const country = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];
  return raw.slice(0, country.digitsMax);
};

const nameRegex = /^[a-zA-Z\s'-]+$/;

const contactSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required.")
    .min(2, "First name must be at least 2 characters.")
    .regex(nameRegex, "First name must only contain letters, spaces, hyphens, or apostrophes."),
  lastName: z
    .string()
    .min(1, "Last name is required.")
    .min(2, "Last name must be at least 2 characters.")
    .regex(nameRegex, "Last name must only contain letters, spaces, hyphens, or apostrophes."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter a valid work email.")
    .email("Please enter a valid work email address.")
    .refine((val) => !/^\d+@/.test(val), {
      message: "Please enter a valid work email address (username cannot be only numbers).",
    }),
  countryCode: z.string(),
  phone: z.string(),
  subject: z
    .string()
    .min(1, "Subject is required.")
    .min(3, "Subject must be at least 3 characters.")
    .max(100, "Subject cannot exceed 100 characters."),
  message: z
    .string()
    .min(1, "Please enter your message.")
    .min(10, "Message must be at least 10 characters.")
    .max(2000, "Message cannot exceed 2000 characters."),
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

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("+1");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  const currentCountry = COUNTRY_CODES.find((c) => c.code === selectedCountryCode) || COUNTRY_CODES[0];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      countryCode: "+1",
      phone: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const formattedPhone = selectedCountryCode === "+other"
      ? data.phone.trim()
      : `${selectedCountryCode} ${data.phone.replace(/\D/g, "")}`;

    try {
      await publicService.submitContactForm({
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phone: formattedPhone,
        subject: data.subject,
        message: data.message,
      });
      setSuccess(true);
      reset();
      setPhoneNumber("");
      setSelectedCountryCode("+1");
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to send message. Please check your network connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText("+15551234567").then(() => {
      alert("Phone number '+1 (555) 123-4567' copied to clipboard!");
    }).catch(() => {
      alert("Call: +1 (555) 123-4567");
    });
    window.location.href = "tel:+15551234567";
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText("support@aurexion.com").then(() => {
      alert("Email address 'support@aurexion.com' copied to clipboard!");
    }).catch(() => {
      alert("Email: support@aurexion.com");
    });
    window.location.href = "mailto:support@aurexion.com";
  };

  return (
    <div className="bg-background pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-x-hidden">
      <SEO
        title="Contact Aurexion | Enterprise Engineering & Advisory Inquiries"
        description="Connect directly with Aurexion Technologies engineering directors and solution architects. Inquire about custom enterprise software, AI, and cloud modernization."
        canonical="/contact"
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* 1. Top Hero Section - Centered */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-primary font-mono text-xs sm:text-sm tracking-widest uppercase mb-3 block">
            CONTACT US
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* 2. Main Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* LEFT — Contact Information (~45% width: 5 of 12 cols) */}
          <div className="lg:col-span-5 min-w-0 w-full">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">
              Let's Start a Conversation
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
              Our team is here to help you succeed. Whether you have questions about features, need technical support, or want to discuss custom solutions, we're here to assist.
            </p>

            <div className="space-y-6">
              {/* Email */}
              <a 
                href="mailto:support@aurexion.com" 
                onClick={handleEmailClick}
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div className="shrink-0 p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 mt-0.5 transition-colors group-hover:bg-primary/20">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 group-hover:text-primary transition-colors">Email</h3>
                  <span className="text-muted-foreground group-hover:text-primary/80 text-sm transition-colors block">
                    support@aurexion.com
                  </span>
                </div>
              </a>

              {/* Phone */}
              <a 
                href="tel:+15551234567" 
                onClick={handlePhoneClick}
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div className="shrink-0 p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 mt-0.5 transition-colors group-hover:bg-primary/20">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 group-hover:text-primary transition-colors">Phone</h3>
                  <span className="text-muted-foreground group-hover:text-primary/80 text-sm transition-colors block">
                    +1 (555) 123-4567
                  </span>
                </div>
              </a>

              {/* Office */}
              <a 
                href="https://maps.google.com/?q=123+Innovation+Street,+San+Francisco,+CA+94102" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => {
                  e.preventDefault();
                  window.open("https://maps.google.com/?q=123+Innovation+Street,+San+Francisco,+CA+94102", "_blank");
                }}
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div className="shrink-0 p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 mt-0.5 transition-colors group-hover:bg-primary/20">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5 group-hover:text-primary transition-colors">Office</h3>
                  <span className="text-muted-foreground group-hover:text-primary/80 text-sm leading-relaxed block transition-colors">
                    123 Innovation Street<br />
                    San Francisco, CA 94102
                  </span>
                </div>
              </a>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="shrink-0 p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20 mt-0.5">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base mb-0.5">Hours</h3>
                  <p className="text-muted-foreground text-sm">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-muted-foreground text-sm">Saturday - Sunday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT — Contact Form (~55% width: 7 of 12 cols) */}
          <div className="lg:col-span-7 min-w-0 w-full">
            <div className="bg-card border border-border/40 rounded-xl p-6 sm:p-8 md:p-10 shadow-lg">
              {success ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <CheckCircle2 className="h-16 w-16 text-primary mb-6 animate-pulse" />
                  <h3 className="text-2xl font-bold text-foreground mb-3">Message Sent</h3>
                  <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                    Thank you for reaching out. A member of our team will get back to you shortly.
                  </p>
                  <button type="button" 
                    onClick={() => {
                      setSuccess(false);
                      setSubmitError(null);
                    }} 
                    className="mt-8 text-primary hover:underline text-sm font-medium transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
                    Send us a Message
                  </h3>
                  
                  {submitError && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium mb-0.5">Submission Error</p>
                        <p className="text-xs opacity-90">{submitError}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                    {/* Row 1: First Name | Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="block text-sm font-medium text-muted-foreground">
                          First Name <span className="text-destructive">*</span>
                        </label>
                        <input 
                          id="firstName" 
                          {...register("firstName")} 
                          aria-invalid={!!errors.firstName}
                          className={`w-full h-11 px-3.5 py-2.5 rounded-md bg-background border ${errors.firstName ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground transition-colors`} 
                          placeholder="Enter your first name"
                        />
                        {errors.firstName && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="block text-sm font-medium text-muted-foreground">
                          Last Name <span className="text-destructive">*</span>
                        </label>
                        <input 
                          id="lastName" 
                          {...register("lastName")} 
                          aria-invalid={!!errors.lastName}
                          className={`w-full h-11 px-3.5 py-2.5 rounded-md bg-background border ${errors.lastName ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground transition-colors`} 
                          placeholder="Enter your last name"
                        />
                        {errors.lastName && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Work Email | Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
                          Work Email <span className="text-destructive">*</span>
                        </label>
                        <input 
                          id="email" 
                          type="email"
                          {...register("email")} 
                          aria-invalid={!!errors.email}
                          className={`w-full h-11 px-3.5 py-2.5 rounded-md bg-background border ${errors.email ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground transition-colors`} 
                          placeholder="Enter your work email"
                        />
                        {errors.email && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            {errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground">
                          Phone Number <span className="text-destructive">*</span>
                        </label>
                        <div className="flex gap-2">
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
                            className="h-11 px-3 py-2.5 rounded-md bg-background border border-input focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground transition-colors cursor-pointer shrink-0 font-medium"
                            style={{
                              backgroundColor: "#050811",
                              color: "#f8fafc",
                              border: "1px solid rgba(140, 174, 187, 0.25)",
                              minWidth: "90px",
                              maxWidth: "110px",
                            }}
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code} style={{ backgroundColor: "#050811", color: "#f8fafc" }}>
                                {c.flag} {c.code}
                              </option>
                            ))}
                          </select>
                          <div className="flex-1">
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
                              aria-invalid={!!errors.phone}
                              className={`w-full h-11 px-3.5 py-2.5 rounded-md bg-background border ${errors.phone ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground font-mono placeholder:font-sans transition-colors`} 
                              placeholder="Enter phone number"
                            />
                          </div>
                        </div>
                        {errors.phone && (
                          <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                            <AlertCircle size={13} className="shrink-0" />
                            <span>{errors.phone.message}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Subject */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="block text-sm font-medium text-muted-foreground">
                        Subject <span className="text-destructive">*</span>
                      </label>
                      <input 
                        id="subject" 
                        {...register("subject")} 
                        aria-invalid={!!errors.subject}
                        className={`w-full h-11 px-3.5 py-2.5 rounded-md bg-background border ${errors.subject ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground transition-colors`} 
                        placeholder="Enter subject"
                      />
                      {errors.subject && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>

                    {/* Row 4: Message */}
                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-sm font-medium text-muted-foreground">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <textarea 
                        id="message" 
                        rows={5}
                        {...register("message")} 
                        aria-invalid={!!errors.message}
                        className={`w-full p-3.5 rounded-md bg-background border ${errors.message ? 'border-destructive ring-1 ring-destructive/30' : 'border-input'} focus:outline-none focus:ring-1 focus:ring-primary text-sm text-foreground resize-none transition-colors`} 
                        placeholder="Enter your message"
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm cursor-pointer"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;
