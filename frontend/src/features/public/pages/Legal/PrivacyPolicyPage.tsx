import React from "react";
import { Shield } from "lucide-react";
import LegalPageLayout, { LegalSectionItem } from "./components/LegalPageLayout";

const LAST_UPDATED = "August 11, 2026";

const sections: LegalSectionItem[] = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "1.1 Information You Provide Directly",
        text: "When you use our platform, submit an RFP, contact us, or apply for a position, we collect: full name, company name, work email address, phone number, designation/job title, country of residence, project descriptions, uploaded documents (résumés, RFP attachments), and any other information you voluntarily provide.",
      },
      {
        subtitle: "1.2 Automatically Collected Information",
        text: "We automatically collect certain technical information when you visit our platform, including: IP address, browser type and version, operating system, referring URL, pages visited, time spent on pages, and device identifiers. This data is collected via server logs, cookies, and similar tracking technologies.",
      },
      {
        subtitle: "1.3 Information from Cookies",
        text: "We use cookies and similar technologies to enhance your experience, analyse site traffic, and personalise content. For full details on our cookie usage, please refer to our Cookie Policy.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "",
        text: "Aurexion Technologies processes your personal data on the following lawful bases and for the following purposes: (a) to respond to your enquiries, RFP submissions, and consultation requests; (b) to process and evaluate job applications submitted through our Careers portal; (c) to provide, maintain, and improve our platform and services; (d) to send administrative communications, including project status updates and support ticket responses; (e) to comply with applicable legal obligations; (f) to analyse usage patterns and improve user experience; and (g) to detect and prevent fraudulent or unauthorised activity.",
      },
    ],
  },
  {
    id: "data-sharing",
    title: "3. Data Sharing & Disclosure",
    content: [
      {
        subtitle: "3.1 We Do Not Sell Your Data",
        text: "Aurexion Technologies does not sell, rent, or trade your personal information to third parties for their commercial purposes.",
      },
      {
        subtitle: "3.2 Service Providers",
        text: "We share data with trusted third-party service providers who assist us in operating our platform (e.g., cloud hosting providers, email delivery services, analytics providers). These parties are contractually obligated to maintain the confidentiality and security of your data.",
      },
      {
        subtitle: "3.3 Legal Requirements",
        text: "We may disclose your information where required by applicable law, court order, or governmental authority, or where necessary to protect the rights, property, or safety of Aurexion Technologies, our clients, or others.",
      },
    ],
  },
  {
    id: "data-security",
    title: "4. Data Security",
    content: [
      {
        subtitle: "",
        text: "We implement industry-standard technical and organisational security measures to protect your personal information against unauthorised access, disclosure, alteration, or destruction. These include TLS/HTTPS encryption in transit, AES-256 encryption at rest, role-based access controls (RBAC), routine security audits, and OWASP Top 10 compliance. Despite these measures, no internet transmission or electronic storage is 100% secure. We encourage you to use strong passwords and report any suspected security issues to security@aurexion.io.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "5. Data Retention",
    content: [
      {
        subtitle: "",
        text: "We retain your personal data only as long as necessary to fulfil the purposes outlined in this policy, unless a longer retention period is required by law. RFP and contact enquiry data is retained for 36 months from submission. Job application data is retained for 12 months from the date of application. Client project data is retained for the duration of the engagement plus 7 years for compliance purposes.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: [
      {
        subtitle: "",
        text: "Depending on your jurisdiction, you may have the following rights regarding your personal data: Right of Access — request a copy of the data we hold about you. Right to Rectification — request correction of inaccurate or incomplete data. Right to Erasure — request deletion of your personal data under certain conditions. Right to Restriction — request restriction of processing in certain circumstances. Right to Data Portability — receive your data in a structured, machine-readable format. Right to Object — object to processing based on legitimate interests. To exercise any of these rights, please contact us at privacy@aurexion.io.",
      },
    ],
  },
  {
    id: "cookies",
    title: "7. Cookies",
    content: [
      {
        subtitle: "",
        text: "Our platform uses cookies and similar tracking technologies. For detailed information about the types of cookies we use and how to manage your preferences, please review our Cookie Policy.",
      },
    ],
  },
  {
    id: "international",
    title: "8. International Data Transfers",
    content: [
      {
        subtitle: "",
        text: "Aurexion Technologies operates globally and may transfer your personal data to countries outside your country of residence. Where such transfers occur to countries that do not provide an equivalent level of data protection, we implement appropriate safeguards, including Standard Contractual Clauses (SCCs) approved by relevant data protection authorities.",
      },
    ],
  },
  {
    id: "changes",
    title: "9. Changes to This Privacy Policy",
    content: [
      {
        subtitle: "",
        text: "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable legal requirements. We will notify you of any material changes by updating the 'Last Updated' date at the top of this policy.",
      },
    ],
  },
  {
    id: "contact",
    title: "10. Contact Our Privacy Team",
    content: [
      {
        subtitle: "",
        text: "If you have any questions, concerns, or requests regarding this Privacy Policy or the processing of your personal data, please contact our Data Protection Officer at: privacy@aurexion.io | Aurexion Technologies, 100 Innovation Way, Suite 400, San Francisco, CA 94105.",
      },
    ],
  },
];

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalPageLayout
      icon={Shield}
      badgeLabel="LEGAL / PRIVACY"
      title="Privacy Policy"
      description="This Privacy Policy explains how Aurexion Technologies collects, uses, discloses, and safeguards your personal information when you interact with our platform and services."
      lastUpdated={LAST_UPDATED}
      sections={sections}
      relatedLinks={[
        { title: "TERMS & CONDITIONS", href: "/terms" },
        { title: "COOKIE POLICY", href: "/cookie-policy" },
      ]}
    />
  );
};

export default PrivacyPolicyPage;
