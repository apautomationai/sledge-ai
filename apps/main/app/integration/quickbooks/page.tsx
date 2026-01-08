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

const whatIsItTitle = "AI-Powered Invoice Automation with Human Control";
const whatIsItDescription =
  "Sledge uses AI to extract and prepare construction invoice data, but humans always make the final decision. Invoices must be approved in Sledge before syncing into QuickBooks. Rejected invoices are automatically sent back to the sender for correction.";

const aiFoundationTitle = "how sledge works with quickbooks";
const aiFoundationText = "";
const aiFoundationSteps: Step[] = [
  {
    icon: "/images/icon-capture 1.svg",
    title: "1. Invoices Are Captured and Read by AI",
    description:
      "AI captures emails, documents, and attachments as they arrive.",
  },
  {
    icon: "/images/icon-understand 1.svg",
    title: "2. AI Matches or Creates Accounting Records",
    description:
      "Invoices are matched to existing QuickBooks records. New ones are created only when required.",
  },
  {
    icon: "/images/icon-complete 1.svg",
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

const builtToRunTitle = "Built to Automate Construction Accounting";
const builtToRunSubtitle = "— Not Just Invoices";
const builtToRunDescription =
  "Eliminate manual invoice entry and keep QuickBooks clean with AI-powered construction accounting automation.";

const heroLogo = {
  src: "/images/quickbooks-brand-preferred-logo-50-50-white-external 1.svg",
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
      "No. Sledge does not replace QuickBooks. Sledge works alongside QuickBooks by automating invoice intake, approvals, and data entry — then syncing clean, approved data into QuickBooks.",
  },
  {
    question: "How does Sledge automate invoice entry in QuickBooks?",
    answer: (
      <>
        Sledge uses AI to:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Capture invoices from email and uploads</li>
          <li>Extract line items, totals, vendors, and job details</li>
          <li>Route invoices through approval or rejection workflows</li>
          <li>Sync approved bills directly into QuickBooks</li>
        </ul>
        <p className="mt-2">
          This eliminates manual invoice entry while keeping QuickBooks as your
          system of record.
        </p>
      </>
    ),
  },
  {
    question: "What QuickBooks data does Sledge sync?",
    answer: (
      <>
        Sledge syncs approved accounts payable data into QuickBooks, including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Vendors</li>
          <li>Bills</li>
          <li>Line items</li>
          <li>Totals and dates</li>
          <li>Job or cost-related information (when applicable)</li>
        </ul>
        <p className="mt-2">Only approved, validated data is synced.</p>
      </>
    ),
  },
  {
    question:
      "Does Sledge sync invoices to QuickBooks automatically or require approval?",
    answer:
      "Invoices require approval first. Sledge automates processing, but nothing syncs to QuickBooks until a human reviews and approves it. This prevents errors, duplicates, and incorrect postings.",
  },
  {
    question: "Does Sledge support QuickBooks Online?",
    answer:
      "Yes. Sledge integrates with QuickBooks Online, which is widely used for construction accounting and job-based workflows.",
  },
  {
    question: "Is my QuickBooks data secure with Sledge?",
    answer:
      "Yes. Sledge uses secure authentication and modern security best practices when connecting to QuickBooks. Access is limited strictly to what's required for invoice automation and syncing.",
  },
  {
    question: "How long does it take to connect Sledge to QuickBooks?",
    answer:
      "Most teams connect Sledge to QuickBooks in just a few minutes. No IT setup, complex configuration, or long onboarding required.",
  },
  {
    question:
      "How is Sledge different from other QuickBooks integrations used in construction?",
    answer: (
      <>
        Most QuickBooks integrations still rely on manual entry, rigid
        workflows, or complex setup.
        <p className="mt-2">Sledge is different:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>AI-first invoice processing</li>
          <li>Built specifically for construction accounting</li>
          <li>Approval-driven, not auto-posting</li>
          <li>Simple setup with immediate value</li>
        </ul>
        <p className="mt-2">
          Sledge reduces accounting overhead instead of adding more steps.
        </p>
      </>
    ),
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
            secondaryButtonText="SCHEDULE A DEMO"
            secondaryButtonHref="#demo"
          />
        </div>
        <FAQ faqs={faqs} />
      </main>
      <Footer />
    </div>
  );
}
