import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { IntegrationHero } from "@/components/integration/hero";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ, FAQItem } from "@/components/product/faq";
import { WhatsIncluded } from "@/components/pricing/whats-included";
import {
  AIFoundationWorking,
  Step,
} from "@/components/product/ai-foundation-working";
import WhatIsIt from "@/components/landing/what-is-it";

export const metadata: Metadata = {
  title: "QuickBooks Accounts Payable Integration for Construction | Sledge",
  description:
    "Automate construction invoice entry, approvals, and syncing into QuickBooks with AI-powered accounts payable software.",
  openGraph: {
    title: "QuickBooks Accounts Payable Integration for Construction | Sledge",
    description:
      "Automate construction invoice entry, approvals, and syncing into QuickBooks with AI-powered accounts payable software.",
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
    title: "QuickBooks Accounts Payable Integration for Construction | Sledge",
    description:
      "Automate construction invoice entry, approvals, and syncing into QuickBooks with AI-powered accounts payable software.",
    images: ["/images/hero-visual.png"],
  },
};

const whatIsItTitle = "AI-Powered Invoice Automation with Human Control";
const whatIsItDescription =
  "Sledge uses AI to extract and prepare construction invoice data, but humans always make the final decision. Invoices must be approved in Sledge before syncing into QuickBooks. Rejected invoices are automatically sent back to the sender for correction.";

const aiFoundationTitle = "how sledge works with quickbooks";
const aiFoundationText = "";
const aiFoundationSteps: Step[] = [
  {
    icon: "/images/product/icon-display-email-capture.png",
    title: "1. Invoices Are Captured and Read by AI",
    description:
      "AI automatically captures emails, documents, and attachments as they arrive.",
  },
  {
    icon: "/images/product/icon-display-ai-understand.png",
    title: "2. AI Matches or Creates Accounting Records",
    description:
      "Invoices are matched to existing QuickBooks records. New ones are created only when required.",
  },
  {
    icon: "/images/product/icon-display-checklist.png",
    title: "3. Humans Approve Before Syncing to QuickBooks",
    description:
      "Approved invoices sync to QuickBooks. Rejected ones are stopped and sent back.",
  },
];

const whatsIncludedTitle = "WHAT SYNCS WITH QUICKBOOKS";
const whatsIncludedText =
  "Sledge maintains a live, intelligent sync with QuickBooks to ensure invoices are entered accurately and without duplicates.";
const whatsIncludedSubtitle = "SYNCED FROM QUICKBOOKS";
const whatsIncludedFeatures = [
  "Vendors",
  "Customers",
  "Chart of Accounts",
  "Products & Services (cost codes)",
];

const whatsIncludedSubtitle2 = "MATCHED, CREATED, AND SYNCED BY SLEDGE";
const whatsIncludedFeatures2 = [
  "Vendors (matched to prevent duplicates)",
  "Customers",
  "Products & Services (cost codes)",
  "Approved bills and invoices",
  "Attachments and audit context",
  "Approval status",
];

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "Not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts.";

const heroLogo = {
  src: "/images/product/quickbooks-brand-preferred-logo-50-50-white-external 1.png",
  alt: "Intuit QuickBooks",
  width: 251,
  height: 64,
};
const heroLogoLabel = "QuickBooks";
const heroTitle =
  "QuickBooks Integration for Construction Accounting & Invoice Automation";
const heroDescription =
  "Automate construction invoice entry, approvals, and syncing into QuickBooks using AI — no manual data entry required. Sledge prepares, matches, and syncs approved invoices into QuickBooks while keeping humans in control.";

const faqs: FAQItem[] = [
  {
    question: "Does Sledge replace QuickBooks?",
    answer:
      "No. Sledge works with QuickBooks, not instead of it. QuickBooks remains your system of record for accounting. Sledge automates invoice intake, data entry, approvals, and syncing so your QuickBooks stays accurate without manual work.",
  },
  {
    question: "How does Sledge automate invoice entry in QuickBooks?",
    answer:
      "Sledge uses AI to capture invoices from email or uploads, read and extract all invoice data, match it to your QuickBooks fields, and prepare it for approval. Once approved, the invoice is automatically synced into QuickBooks with all fields populated.",
  },
  {
    question: "What QuickBooks data does Sledge sync?",
    answer: (
      <>
        Sledge syncs both from and to QuickBooks, including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Vendors</li>
          <li>Customers</li>
          <li>Chart of accounts</li>
          <li>Products & services (cost codes)</li>
          <li>Approved bills and invoices</li>
          <li>Attachments and audit context</li>
          <li>Approval status</li>
        </ul>
        <p className="mt-2">
          This keeps both systems aligned without duplicates.
        </p>
      </>
    ),
  },
  {
    question: "How does Sledge prevent duplicate vendors and records?",
    answer:
      "Sledge intelligently matches invoices to existing QuickBooks records using names, addresses, and contextual data. If a close match exists, Sledge uses it. If not, Sledge creates a new record automatically — preventing duplicates and messy data.",
  },
  {
    question:
      "Can Sledge create vendors, customers, or cost codes in QuickBooks?",
    answer:
      "Yes. If an invoice includes a vendor, customer, or cost code that doesn't already exist, Sledge can automatically create it in QuickBooks after approval.",
  },
  {
    question: "Do invoices sync automatically without approval?",
    answer:
      "No. Humans stay in control. Invoices must be approved in Sledge before they sync to QuickBooks. Rejected invoices are not synced and can be sent back for correction.",
  },
  {
    question: "What happens when an invoice is rejected?",
    answer:
      "Rejected invoices are stopped before syncing and can automatically trigger a response back to the sender requesting correction — keeping incorrect data out of QuickBooks.",
  },
  {
    question: "Is this built specifically for construction accounting?",
    answer:
      "Yes. Sledge is designed for construction accounting workflows, including cost codes, project-based expenses, vendor-heavy operations, and high invoice volume — not generic small-business AP.",
  },
  {
    question: "Does Sledge support QuickBooks Online?",
    answer:
      "Yes. Sledge integrates with QuickBooks Online, using secure, native API connections.",
  },
  {
    question: "Is my QuickBooks data secure?",
    answer:
      "Yes. Sledge uses secure OAuth connections, encrypted data handling, and maintains a full audit trail for every invoice synced to QuickBooks.",
  },
  {
    question: "Can Sledge handle high invoice volume?",
    answer:
      "Yes. Sledge is built for high-volume construction teams processing dozens or hundreds of invoices per month — without per-invoice fees or usage caps.",
  },
  {
    question: "How long does it take to connect Sledge to QuickBooks?",
    answer:
      "Most teams can connect QuickBooks to Sledge in just a few minutes and start syncing invoices the same day.",
  },
  {
    question:
      "How is this different from Procore or Buildertrend's QuickBooks integration?",
    answer:
      "Sledge focuses on AI-driven invoice intake, data extraction, and clean accounting sync, not project management. That means less manual work, fewer errors, and a cleaner QuickBooks — without forcing you into a full construction ERP.",
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
          <IntegrationHero
            logo={heroLogo}
            logoLabel={heroLogoLabel}
            title={heroTitle}
            description={heroDescription}
          />
          <AIFoundationWorking
            title={aiFoundationTitle}
            text={aiFoundationText}
            steps={aiFoundationSteps}
          />
          <WhatIsIt title={whatIsItTitle} description={whatIsItDescription} />
          <WhatsIncluded
            title={whatsIncludedTitle}
            text={whatsIncludedText}
            subtitle={whatsIncludedSubtitle}
            features={whatsIncludedFeatures}
          />

          <WhatsIncluded
            subtitle={whatsIncludedSubtitle2}
            features={whatsIncludedFeatures2}
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
