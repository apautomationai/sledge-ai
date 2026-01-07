import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ, FAQItem } from "@/components/product/faq";
import { Hero } from "@/components/industries/hero";
import WhatIsIt from "@/components/landing/what-is-it";
import {
  AIFoundationWorking,
  Step,
} from "@/components/product/ai-foundation-working";

const aiFoundationTitle = "Construction Back Office Workflows, Automated";
const aiFoundationSteps: Step[] = [
  {
    icon: "/images/icon-capture 11.svg",
    title: "Invoice Management",
    description:
      "AI-powered invoice creation, tracking, and approvals across jobs.",
  },
  {
    icon: "/images/icon-capture 22.svg",
    title: "Lien Waivers",
    description:
      "Generate, track, and exchange lien waivers without paperwork risk.",
  },
  {
    icon: "/images/icon-capture 3.svg",
    title: "Vendor Management",
    description: "Centralize vendors, contracts, and documents in one system.",
  },
  {
    icon: "/images/icon-capture 4.svg",
    title: "Project Financials",
    description:
      "Real-time visibility into what's billed, paid, and outstanding.",
  },
];

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "Not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts.";

const heroSubtitle =
  "Construction Contractor Software | AI Back Office for Construction – Sledge";
const heroTitle = "CONSTRUCTION MANAGEMENT BUILT FOR REAL JOBS.";
const heroDescription =
  "AI-powered construction management software built for real jobs. Automate invoicing, payments, and back-office workflows without changing how construction teams operate.";
const heroImage = {
  src: "/images/Frame 84.svg",
  alt: "Construction Management Software",
};

const whatIsItTitle = "AI-Powered Back Office Software for Construction";
const whatIsItDescription =
  "Sledge is AI-powered back office software built for construction teams.It automates operational work like document intake, approvals, and accounting workflows using autonomous AI — reducing manual work without changing how teams operate.";

const faqs: FAQItem[] = [
  {
    question: "Who is Sledge built for in construction?",
    answer:
      "Sledge is built for general contractors, subcontractors, concrete contractors, specialty trades, office managers, and construction accountants who need to automate back-office work without disrupting field operations.",
  },
  {
    question: "Is Sledge a full construction management platform?",
    answer:
      "No. Sledge focuses on construction back-office workflows, not field scheduling or project execution. It automates invoicing, approvals, vendor management, lien waivers, and financial workflows so construction teams can stay focused on the jobsite.",
  },
  {
    question: "How does Sledge fit alongside tools like Procore or Buildertrend?",
    answer:
      "Sledge complements field management platforms. While tools like Procore and Buildertrend manage jobs, schedules, and documents, Sledge automates the financial and administrative work that happens behind the scenes.",
  },
  {
    question: "Does Sledge work for both GCs and subcontractors?",
    answer:
      "Yes. Sledge is designed to support both general contractors and subcontractors, handling inbound invoices, approvals, vendor records, and accounting syncs across different construction workflows.",
  },
  {
    question: "Can Sledge handle construction-specific invoices?",
    answer:
      "Yes. Sledge is built to process construction invoices, including line items, cost codes, retainage, attachments, and job-based approvals.",
  },
  {
    question: "Does Sledge support lien waiver workflows?",
    answer:
      "Yes. Sledge supports conditional and unconditional lien waiver workflows, including generation, tracking, and exchange — reducing paperwork delays and compliance risk.",
  },
  {
    question: "Can Sledge handle multiple projects and jobs?",
    answer:
      "Yes. Sledge supports multiple projects, automatically associating invoices, vendors, and approvals to the correct job.",
  },
  {
    question: "How does Sledge handle vendor and subcontractor management?",
    answer:
      "Sledge centralizes vendors, subcontractors, contracts, invoices, and documents in one system and keeps records synced with your accounting software.",
  },
  {
    question: "Will Sledge replace my accounting software?",
    answer:
      "No. Sledge works with your accounting system. It automates intake, approvals, and data entry, then syncs everything into tools like QuickBooks.",
  },
  {
    question: "Does Sledge work for small construction companies?",
    answer:
      "Yes. Sledge works for small, mid-size, and growing construction businesses. Pricing does not change based on company size or invoice volume.",
  },
  {
    question: "How secure is Sledge for construction financial data?",
    answer:
      "Sledge uses secure, native API connections, encrypted data handling, and full audit trails. Sensitive financial and vendor data stays protected at all times.",
  },
  {
    question: "How long does it take to get set up?",
    answer:
      "Most construction teams can start using Sledge the same day. There's no heavy implementation or complex onboarding.",
  },
  {
    question: "What makes Sledge different from traditional construction software?",
    answer:
      "Sledge is built AI-first and focused entirely on back-office automation. Instead of forcing teams into rigid workflows, it adapts to how construction teams already work.",
  },
  {
    question: "Can Sledge scale as my construction business grows?",
    answer:
      "Yes. Sledge scales with your business, supporting more projects, vendors, invoices, and team members without added complexity or fees.",
  },
];

export default function Integrations() {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <main className="flex flex-col">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/images/gpt4.png')",
            zIndex: -1,
          }}
        />
        {/* Black overlay with opacity */}
        <div
          className="fixed inset-0 bg-black pointer-events-none"
          style={{
            opacity: 0.7,
            zIndex: -1,
          }}
        />
        <Hero
          subtitle={heroSubtitle}
          title={heroTitle}
          description={heroDescription}
          image={heroImage}
        />
        <WhatIsIt title={whatIsItTitle} description={whatIsItDescription} />
        <AIFoundationWorking
          title={aiFoundationTitle}
          steps={aiFoundationSteps}
        />
        <BuiltToRun
          title={builtToRunTitle}
          subtitle={builtToRunSubtitle}
          description={builtToRunDescription}
        />
      </main>
      <FAQ faqs={faqs} />
      <Footer />
    </div>
  );
}
