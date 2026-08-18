import React from "react";
import { Link } from "wouter";
import { ArrowUpRight, Shield, Eye, Lock, FileText, Globe, Mail } from "lucide-react";

const LAST_UPDATED = "August 11, 2026";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "1.1 Information You Provide Directly",
        text: "When you use our platform, submit an RFP, contact us, or apply for a position, we collect: full name, company name, work email address, phone number, designation/job title, country of residence, project descriptions, uploaded documents (résumés, RFP attachments), and any other information you voluntarily provide."
      },
      {
        subtitle: "1.2 Automatically Collected Information",
        text: "We automatically collect certain technical information when you visit our platform, including: IP address, browser type and version, operating system, referring URL, pages visited, time spent on pages, and device identifiers. This data is collected via server logs, cookies, and similar tracking technologies."
      },
      {
        subtitle: "1.3 Information from Cookies",
        text: "We use cookies and similar technologies to enhance your experience, analyse site traffic, and personalise content. For full details on our cookie usage, please refer to our Cookie Policy."
      }
    ]
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "",
        text: "Aurexion Technologies processes your personal data on the following lawful bases and for the following purposes: (a) to respond to your enquiries, RFP submissions, and consultation requests; (b) to process and evaluate job applications submitted through our Careers portal; (c) to provide, maintain, and improve our platform and services; (d) to send administrative communications, including project status updates and support ticket responses; (e) to comply with applicable legal obligations; (f) to analyse usage patterns and improve user experience; and (g) to detect and prevent fraudulent or unauthorised activity."
      }
    ]
  },
  {
    id: "data-sharing",
    title: "3. Data Sharing & Disclosure",
    content: [
      {
        subtitle: "3.1 We Do Not Sell Your Data",
        text: "Aurexion Technologies does not sell, rent, or trade your personal information to third parties for their commercial purposes."
      },
      {
        subtitle: "3.2 Service Providers",
        text: "We share data with trusted third-party service providers who assist us in operating our platform (e.g., cloud hosting providers, email delivery services, analytics providers). These parties are contractually obligated to maintain the confidentiality and security of your data."
      },
      {
        subtitle: "3.3 Legal Requirements",
        text: "We may disclose your information where required by applicable law, court order, or governmental authority, or where necessary to protect the rights, property, or safety of Aurexion Technologies, our clients, or others."
      }
    ]
  },
  {
    id: "data-security",
    title: "4. Data Security",
    content: [
      {
        subtitle: "",
        text: "We implement industry-standard technical and organisational security measures to protect your personal information against unauthorised access, disclosure, alteration, or destruction. These include TLS/HTTPS encryption in transit, AES-256 encryption at rest, role-based access controls (RBAC), routine security audits, and OWASP Top 10 compliance. Despite these measures, no internet transmission or electronic storage is 100% secure. We encourage you to use strong passwords and report any suspected security issues to security@aurexion.io."
      }
    ]
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    content: [
      {
        subtitle: "",
        text: "We retain your personal data only as long as necessary to fulfil the purposes outlined in this policy, unless a longer retention period is required by law. RFP and contact enquiry data is retained for 36 months from submission. Job application data is retained for 12 months from the date of application. Client project data is retained for the duration of the engagement plus 7 years for compliance purposes."
      }
    ]
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: [
      {
        subtitle: "",
        text: "Depending on your jurisdiction, you may have the following rights regarding your personal data: Right of Access — request a copy of the data we hold about you. Right to Rectification — request correction of inaccurate or incomplete data. Right to Erasure — request deletion of your personal data under certain conditions. Right to Restriction — request restriction of processing in certain circumstances. Right to Data Portability — receive your data in a structured, machine-readable format. Right to Object — object to processing based on legitimate interests. To exercise any of these rights, please contact us at privacy@aurexion.io."
      }
    ]
  },
  {
    id: "cookies",
    title: "7. Cookies",
    content: [
      {
        subtitle: "",
        text: "Our platform uses cookies and similar tracking technologies. For detailed information about the types of cookies we use and how to manage your preferences, please review our Cookie Policy."
      }
    ]
  },
  {
    id: "international",
    title: "8. International Data Transfers",
    content: [
      {
        subtitle: "",
        text: "Aurexion Technologies operates globally and may transfer your personal data to countries outside your country of residence. Where such transfers occur to countries that do not provide an equivalent level of data protection, we implement appropriate safeguards, including Standard Contractual Clauses (SCCs) approved by relevant data protection authorities."
      }
    ]
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: [
      {
        subtitle: "",
        text: "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify you of material changes by updating the 'Last Updated' date at the top of this page. Your continued use of our platform after such changes constitutes your acceptance of the revised policy."
      }
    ]
  },
  {
    id: "contact",
    title: "10. Contact Us",
    content: [
      {
        subtitle: "",
        text: "If you have any questions, concerns, or requests regarding this Privacy Policy or the processing of your personal data, please contact our Data Protection Officer at: privacy@aurexion.io | Aurexion Technologies, 100 Innovation Way, Suite 400, San Francisco, CA 94105."
      }
    ]
  }
];

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(135deg, #050811 0%, #060d1a 50%, #050811 100%)",
          padding: "8rem 0 5rem",
          borderBottom: "1px solid rgba(99,245,232,0.1)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 60% 40% at 70% 50%, rgba(99,245,232,0.04) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 max(4vw, 1.5rem)", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
            <Shield size={14} color="#63f5e8" />
            <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", letterSpacing: ".18em", color: "#63f5e8" }}>LEGAL / PRIVACY</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 500, letterSpacing: "-.05em", lineHeight: 1, color: "#eef4f3", margin: "0 0 1.5rem" }}>
            Privacy Policy
          </h1>
          <p style={{ color: "#8da5ae", lineHeight: 1.7, maxWidth: "600px", fontSize: ".95rem", margin: "0 0 2rem" }}>
            This Privacy Policy explains how Aurexion Technologies collects, uses, discloses, and safeguards your personal information when you interact with our platform and services.
          </p>
          <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".7rem", color: "#5e7079", letterSpacing: ".05em" }}>
            Last Updated: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Content */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "4rem max(4vw, 1.5rem) 6rem" }}>
        {/* Table of Contents */}
        <div style={{ border: "1px solid rgba(99,245,232,0.12)", background: "#060c18", padding: "2rem", marginBottom: "3rem" }}>
          <p style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".65rem", letterSpacing: ".15em", color: "#63f5e8", marginBottom: "1.2rem" }}>TABLE OF CONTENTS</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: ".5rem" }}>
            {sections.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{ color: "#8da5ae", fontSize: ".85rem", textDecoration: "none", padding: ".3rem 0", borderBottom: "1px solid transparent" }}
                onMouseOver={e => (e.currentTarget.style.color = "#63f5e8")}
                onMouseOut={e => (e.currentTarget.style.color = "#8da5ae")}
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {sections.map((s, idx) => (
          <div key={s.id} id={s.id} style={{ marginBottom: "3rem", paddingBottom: "3rem", borderBottom: idx < sections.length - 1 ? "1px solid rgba(140,174,187,0.08)" : "none" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 600, color: "#eef4f3", letterSpacing: "-.02em", marginBottom: "1.5rem" }}>{s.title}</h2>
            {s.content.map((c, i) => (
              <div key={i} style={{ marginBottom: c.subtitle ? "1.5rem" : 0 }}>
                {c.subtitle && (
                  <h3 style={{ fontSize: ".95rem", fontWeight: 600, color: "#b7c4c5", marginBottom: ".8rem" }}>{c.subtitle}</h3>
                )}
                <p style={{ color: "#8da5ae", lineHeight: 1.75, fontSize: ".92rem" }}>{c.text}</p>
              </div>
            ))}
          </div>
        ))}

        {/* Back to top + links */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginTop: "2rem" }}>
          <div style={{ display: "flex", gap: "2rem" }}>
            <Link href="/terms" style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".72rem", color: "#63f5e8", letterSpacing: ".08em", textDecoration: "none" }}>
              TERMS &amp; CONDITIONS →
            </Link>
            <Link href="/cookie-policy" style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".72rem", color: "#63f5e8", letterSpacing: ".08em", textDecoration: "none" }}>
              COOKIE POLICY →
            </Link>
          </div>
          <Link href="/contact" className="signal-button inline-flex items-center gap-2" style={{ fontSize: ".75rem" }}>
            CONTACT US <ArrowUpRight size={13} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
