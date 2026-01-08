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

const aiFoundationTitle = "how sledge works with Outlook";
const aiFoundationText = "";
const aiFoundationSteps: Step[] = [
  {
    icon: "/images/icon-capture 1.svg",
    title: "1. Securely Connects to Your Outlook Inbox",
    description:
      "Connect Outlook or Office 365 inboxes, including shared AP mailboxes.",
  },
  {
    icon: "/images/icon-understand 2.svg",
    title: "2. AI Scans Outlook Emails to Detect Invoices",
    description: "AI scans Outlook emails to find invoices and attachments.",
  },
  {
    icon: "/images/icon-understand 2 (1).svg",
    title: "3. AI Reads and Extracts Invoice Data",
    description:
      "Invoice data like vendor, dates, and totals are captured automatically.",
  },
  {
    icon: "/images/icon-complete 1.svg",
    title: "4. Invoices Are Ready for Human Review",
    description:
      "Review, approve, or reject invoices before they move forward.",
  },
];

const whatsIncludedTitle = "WHAT OUTLOOK FEEDS INTO SLEDGE";
const whatsIncludedText =
  "Sledge uses Outlook as the source of truth for incoming construction invoices.";
const whatsIncludedSubtitle = "";
const whatsIncludedFeatures = [
  "Invoice emails",
  "Invoice attachments (PDFs, scans, images)",
  "Sender and domain information",
  "Email timestamps and metadata",
  "Supporting documentation",
];

const builtToRunTitle = "Automate Construction Invoice Intake from Outlook";
const builtToRunSubtitle = "";
const builtToRunDescription =
  "Stop sorting emails and downloading attachments. Let AI handle invoice intake for you.";

const heroLogo = {
  src: "/images/1024px-Microsoft_Outlook_logo_(2024–2025).svg 1.svg",
  alt: "Outlook",
  width: 85,
  height: 64,
};
const heroLogoLabel = "Outlook";
const heroTitle =
  "Outlook Integration for Construction Invoice Capture & Automation";
const heroDescription =
  "Automatically find, read, and prepare construction invoices directly from your Outlook inbox using AI. No forwarding rules. No manual downloads. Just invoices ready for review.";

const faqs: FAQItem[] = [
  {
    question: "Which Outlook inboxes can Sledge connect to?",
    answer: (
      <>
        Sledge can connect to:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Individual Outlook inboxes</li>
          <li>Shared AP inboxes (e.g. ap@company.com)</li>
          <li>Microsoft 365 mailboxes</li>
        </ul>
        <p className="mt-2">
          This allows Sledge to centralize invoice intake across teams and
          accounts.
        </p>
      </>
    ),
  },
  {
    question: "Does Sledge read all of my Outlook emails?",
    answer: (
      <>
        <p>No.</p>
        <p className="mt-2">Sledge does not read all emails.</p>
        <p className="mt-2">
          Sledge uses AI to identify and process invoice-related emails only,
          ignoring personal or non-invoice messages. Access is limited strictly
          to invoice automation.
        </p>
      </>
    ),
  },
  {
    question: "How does Sledge identify invoice emails in Outlook?",
    answer: (
      <>
        Sledge uses AI to scan incoming Outlook emails and:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Detect invoice-related content</li>
          <li>Identify attachments and invoice language</li>
          <li>Extract invoices automatically</li>
        </ul>
        <p className="mt-2">No manual rules or folder setup required.</p>
      </>
    ),
  },
  {
    question:
      "Do I need to set up forwarding rules or folders in Outlook for Sledge?",
    answer: (
      <>
        <p>No.</p>
        <p className="mt-2">
          Sledge connects directly to Outlook and scans inboxes automatically.
        </p>
        <p className="mt-2">
          You do not need to create forwarding rules, folders, or filters unless
          you choose to.
        </p>
      </>
    ),
  },
  {
    question: "What happens after Sledge finds an invoice in Outlook?",
    answer: (
      <>
        Once an invoice is detected:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Sledge extracts line items, totals, vendors, and dates</li>
          <li>The invoice enters approval or rejection workflows</li>
          <li>Nothing syncs to accounting until approved</li>
        </ul>
        <p className="mt-2">
          This keeps you in full control while eliminating manual entry.
        </p>
      </>
    ),
  },
  {
    question: "Is my Outlook and Microsoft 365 data secure with Sledge?",
    answer:
      "Yes. Sledge uses secure authentication and modern security best practices when connecting to Outlook and Microsoft 365. Data access is limited to what's required for invoice automation only.",
  },
  {
    question: "How long does it take to connect Outlook to Sledge?",
    answer:
      "Most teams connect Outlook to Sledge in just a few minutes. No IT help, complex setup, or long onboarding required.",
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
            columns={3}
          />

          <BuiltToRun
            title={builtToRunTitle}
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
