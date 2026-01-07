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
      "Sledge securely connects to your Outlook inbox using Microsoft authentication. You control which inboxes Sledge can access — including shared AP, accounting, or Office 365 mailboxes",
  },
  {
    icon: "/images/icon-understand 1.svg",
    title: "2. AI Scans Outlook Emails to Detect Invoices",
    description:
      "Sledge AI scans incoming Outlook emails to identify invoice emails and attachments — even when vendors use inconsistent formats, subject lines, or naming conventions.",
  },
  {
    icon: "/images/icon-understand 2.svg",
    title: "3. AI Reads and Extracts Invoice Data",
    description:
      "Once an invoice is detected, Sledge ingests the attachment and uses AI to extract invoice data including vendor, dates, totals, line items, and supporting documents.",
  },
  {
    icon: "/images/icon-complete 10.svg",
    title: "4. Invoices Are Ready for Human Review",
    description:
      "Parsed invoice data is presented in Sledge for review. Users can approve or reject invoices before they move forward in the workflow.Human-in-the-loop stays consistent across integrations.",
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

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts. ";

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
  "Automatically find, read, and prepare construction invoices directly from your Outlook inbox using AI.No forwarding rules. No manual downloads. Just invoices ready for review.";

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
    question: "Do I need to set up forwarding rules or folders in Outlook for Sledge?",
    answer: (
      <>
        <p>No.</p>
        <p className="mt-2">
          Sledge connects directly to Outlook and scans inboxes automatically.
        </p>
        <p className="mt-2">
          You do not need to create forwarding rules, folders, or filters
          unless you choose to.
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
