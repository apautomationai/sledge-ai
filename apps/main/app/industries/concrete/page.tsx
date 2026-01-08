import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ, FAQItem } from "@/components/product/faq";
import { Hero } from "@/components/industries/hero";
import {
  AIFoundationWorking,
  Step,
} from "@/components/product/ai-foundation-working";
import { WhatsIncluded } from "@/components/pricing/whats-included";

export const metadata: Metadata = {
  title: "Accounts Payable Software for Concrete Contractors | Sledge",
  description:
    "Automate accounts payable, invoicing, and vendor payments for concrete contractors with AI-powered construction back-office software.",
  openGraph: {
    title: "Accounts Payable Software for Concrete Contractors | Sledge",
    description:
      "Automate accounts payable, invoicing, and vendor payments for concrete contractors with AI-powered construction back-office software.",
    images: [
      {
        url: "/images/hero-visual.png",
        width: 1200,
        height: 630,
        alt: "Sledge: The Builder's AI Office",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Accounts Payable Software for Concrete Contractors | Sledge",
    description:
      "Automate accounts payable, invoicing, and vendor payments for concrete contractors with AI-powered construction back-office software.",
    images: ["/images/hero-visual.png"],
  },
};

const whatsIncludedTitle = "Why Concrete Contractors Choose Sledge";
const whatsIncludedText =
  "Built on an autonomous AI foundation designed for construction back-office workflows.";
const whatsIncludedFeatures = [
  "Built for high invoice volume and fast turnarounds",
  "AI-first automation — less manual entry, fewer mistakes",
  "Works with QuickBooks and existing email workflows",
  "No per-invoice fees or usage caps",
  "Designed for concrete margins, not office-heavy businesses",
];

const aiFoundationTitle =
  "Built for high-volume,fast-moving concrete operations";
const aiFoundationSteps: Step[] = [
  {
    icon: "/images/industries/icon-capture 1.png",
    title: "Invoice Management",
    description:
      "AI-powered invoice creation, tracking, and approvals across jobs.",
  },
  {
    icon: "/images/industries/icon-capture 2.png",
    title: "Lien Waivers",
    description:
      "Generate, track, and exchange lien waivers without paperwork risk.",
  },
  {
    icon: "/images/industries/icon-capture 3.png",
    title: "Vendor Management",
    description: "Centralize vendors, contracts, and documents in one system.",
  },
  {
    icon: "/images/industries/icon-capture 4.png",
    title: "Project Financials",
    description:
      "Real-time visibility into what's billed, paid, and outstanding.",
  },
];

const builtToRunTitle = "sEE IF SLEDGE FITS YOUR CONCRETE OPERATION";
const builtToRunSubtitle = "";
const builtToRunDescription =
  "Built on an autonomous AI foundation designed for construction back-office workflows.";

const heroSubtitle =
  "Construction Contractor Software | AI Back Office for Construction – Sledge";
const heroTitle = `POUR CONCRETE.
WE'LL HANDLE THE PAPERWORK.`;
const heroDescription =
  "AI-powered construction management software built for real jobs. Automate invoicing, payments, and back-office workflows without changing how construction teams operate.";
const heroImage = {
  src: "/images/industries/image-industry-concrete.png",
  alt: "Construction Management Software",
};

const faqs: FAQItem[] = [
  {
    question: "Who is Sledge built for in the concrete industry?",
    answer:
      "Sledge is built for concrete contractors, ready-mix operators, flatwork crews, foundations, paving, and specialty concrete trades that process high invoice volume and need fast, accurate back-office workflows.",
  },
  {
    question: "How does Sledge help with high-volume concrete invoices?",
    answer:
      "Sledge automatically captures invoices from email, reads attachments using AI, extracts line items and totals, and prepares them for approval — eliminating manual data entry even during peak pour schedules.",
  },
  {
    question: "Can Sledge handle same-day or next-day invoice turnaround?",
    answer:
      "Yes. Sledge is designed for fast-moving concrete operations, supporting same-day intake, quick approvals, and immediate syncing to accounting systems.",
  },
  {
    question: "Does Sledge work with ready-mix and material supplier invoices?",
    answer:
      "Yes. Sledge handles invoices from ready-mix suppliers, pump companies, material yards, equipment rentals, and subcontractors, including attachments and delivery tickets.",
  },
  {
    question: "Can Sledge manage lien waivers for concrete jobs?",
    answer:
      "Yes. Sledge supports conditional and unconditional lien waivers, helping concrete contractors generate, track, and exchange waivers without paperwork bottlenecks.",
  },
  {
    question: "How does Sledge help reduce billing and payment delays?",
    answer:
      "By automating invoice intake, approvals, and vendor matching, Sledge reduces delays caused by missing paperwork, incorrect entries, and slow approvals — helping concrete contractors get paid faster.",
  },
  {
    question: "Will Sledge replace my accounting software?",
    answer:
      "No. Sledge works with your accounting system. It automates intake, approvals, and data entry, then syncs everything into tools like QuickBooks.",
  },
  {
    question: "Can Sledge handle multiple pours and projects at once?",
    answer:
      "Yes. Sledge supports multiple jobs and projects, automatically associating invoices and costs with the correct project.",
  },
  {
    question: "Does Sledge work for small and mid-size concrete contractors?",
    answer:
      "Yes. Sledge is designed to work for small, growing, and high-volume concrete businesses. Pricing does not increase based on invoice volume or company size.",
  },
  {
    question: "Is Sledge secure for financial and vendor data?",
    answer:
      "Yes. Sledge uses secure API connections, encrypted data handling, and full audit trails to protect sensitive financial and vendor information.",
  },
  {
    question: "How quickly can a concrete contractor get started?",
    answer:
      "Most concrete teams can start using Sledge the same day, with no complex setup or long onboarding process.",
  },
  {
    question: "What makes Sledge different from generic construction software?",
    answer:
      "Sledge is built AI-first and optimized for high-volume, fast-moving trades like concrete — not slow, office-heavy workflows.",
  },
  {
    question: "Can Sledge scale as my concrete operation grows?",
    answer:
      "Yes. Sledge scales with your operation, supporting more invoices, vendors, and projects without added fees or complexity.",
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
        <div className="relative">
          <Hero
            subtitle={heroSubtitle}
            title={heroTitle}
            description={heroDescription}
            image={heroImage}
          />
          <AIFoundationWorking
            title={aiFoundationTitle}
            steps={aiFoundationSteps}
          />
          <WhatsIncluded
            title={whatsIncludedTitle}
            text={whatsIncludedText}
            features={whatsIncludedFeatures}
          />
          <BuiltToRun
            title={builtToRunTitle}
            subtitle={builtToRunSubtitle}
            description={builtToRunDescription}
          />
        </div>
        <FAQ faqs={faqs} />
      </main>
      <Footer />
    </div>
  );
}
