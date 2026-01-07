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

const aiFoundationTitle = "how sledge works with gmail";
const aiFoundationText = "";
const aiFoundationSteps: Step[] = [
  {
    icon: "/images/icon-capture 1.svg",
    title: "1. Securely Connects to Your Gmail Inbox",
    description: "Secure Gmail integration for your AP and invoice inboxes.",
  },
  {
    icon: "/images/icon-understand 1.svg",
    title: "2. AI Scans Emails to Find Invoices",
    description: "AI scans Gmail to detect invoice emails and attachments.",
  },
  {
    icon: "/images/icon-understand 2.svg",
    title: "3. AI Reads and Extracts Invoice Data",
    description:
      "AI invoice processing extracts key invoice data automatically.",
  },
  {
    icon: "/images/icon-complete 10.svg",
    title: "4. Invoices Are Ready for Human Review",
    description: "Invoices are reviewed and approved before moving forward.",
  },
];

const whatsIncludedTitle = "What Sledge Pulls from Gmail";
const whatsIncludedText =
  "Sledge uses Gmail as the source of truth for incoming invoices.";
const whatsIncludedSubtitle = "";
const whatsIncludedFeatures = [
  "Invoice emails",
  "Invoice attachments (PDFs, scans, images)",
  "Sender information",
  "Email timestamps and metadata",
  "Supporting documentation",
];

const builtToRunTitle = "Automate Construction Invoice Intake from Gmail";
const builtToRunDescription =
  "Stop sorting inboxes and downloading attachments. Let AI do it for you.";

const heroLogo = {
  src: "/images/128px-Gmail_icon_(2020).svg 1.svg",
  alt: "Gmail",
  width: 85,
  height: 64,
};
const heroLogoLabel = "Gmail";
const heroTitle =
  "Gmail Integration for Construction Invoice Capture & Automation";
const heroDescription =
  "Automatically find, extract, and prepare construction invoices directly from your Gmail inbox using AI.No forwarding rules. No manual downloads. Just clean invoices ready for approval.";

const faqs: FAQItem[] = [
  {
    question: "Which Gmail inboxes can Sledge connect to?",
    answer: (
      <>
        Sledge can connect to:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Individual Gmail inboxes</li>
          <li>Shared inboxes (such as ap@company.com)</li>
          <li>Google Workspace accounts</li>
        </ul>
        <p className="mt-2">
          This allows Sledge to centralize invoice intake across teams, jobs,
          or entities.
        </p>
      </>
    ),
  },
  {
    question: "Does Sledge read all of my Gmail emails?",
    answer: (
      <>
        <p>No.</p>
        <p className="mt-2">Sledge does not read all emails.</p>
        <p className="mt-2">
          Sledge uses AI to identify and process invoice-related emails only,
          ignoring personal, internal, or non-invoice messages. Access is
          limited strictly to invoice automation.
        </p>
      </>
    ),
  },
  {
    question: "How does Sledge know which Gmail emails are invoices?",
    answer: (
      <>
        Sledge uses AI to scan incoming Gmail messages and:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Detect invoice-related language and attachments</li>
          <li>Identify common invoice formats</li>
          <li>Automatically recognize invoices without rules or filters</li>
        </ul>
        <p className="mt-2">No manual setup required.</p>
      </>
    ),
  },
  {
    question: "Do I need to forward emails or set up Gmail rules for Sledge?",
    answer: (
      <>
        <p>No.</p>
        <p className="mt-2">
          Sledge connects directly to Gmail and scans inboxes automatically.
        </p>
        <p className="mt-2">
          You do not need to set up forwarding rules, labels, or filters unless
          you choose to.
        </p>
      </>
    ),
  },
  {
    question: "What happens after Sledge finds an invoice in Gmail?",
    answer: (
      <>
        Once an invoice is detected:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Sledge extracts line items, totals, vendors, and dates</li>
          <li>The invoice enters approval or rejection workflows</li>
          <li>Nothing syncs to accounting until it's approved</li>
        </ul>
        <p className="mt-2">
          This keeps you fully in control while eliminating manual data entry.
        </p>
      </>
    ),
  },
  {
    question: "Is my Gmail data secure with Sledge?",
    answer:
      "Yes. Sledge uses secure authentication and modern security best practices when connecting to Gmail and Google Workspace. Data access is limited to what's required for invoice automation only.",
  },
  {
    question: "How quickly can I start using the Gmail integration with Sledge?",
    answer:
      "Most teams connect Gmail to Sledge in just a few minutes. No IT involvement, complex setup, or long onboarding required.",
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
            bgColor="bg-[#141414]"
          />
          <WhatsIncluded
            title={whatsIncludedTitle}
            text={whatsIncludedText}
            subtitle={whatsIncludedSubtitle}
            features={whatsIncludedFeatures}
          />

          <BuiltToRun
            title={builtToRunTitle}
            description={builtToRunDescription}
          />
        </div>
        <FAQ faqs={faqs} />
      </main>
      <Footer />
    </div>
  );
}
