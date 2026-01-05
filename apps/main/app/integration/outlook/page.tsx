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
    icon: "/images/product/icon-display-email-capture.png",
    title: "1. Securely Connects to Your Outlook Inbox",
    description:
      "Sledge securely connects to your Outlook inbox using Microsoft authentication. You control which inboxes Sledge can access — including shared AP, accounting, or Office 365 mailboxes",
  },
  {
    icon: "/images/product/icon-understand 1.png",
    title: "2. AI Scans Outlook Emails to Detect Invoices",
    description:
      "Sledge AI scans incoming Outlook emails to identify invoice emails and attachments — even when vendors use inconsistent formats, subject lines, or naming conventions.",
  },
  {
    icon: "/images/product/icon-understand 2.png",
    title: "3. AI Reads and Extracts Invoice Data",
    description:
      "Once an invoice is detected, Sledge ingests the attachment and uses AI to extract invoice data including vendor, dates, totals, line items, and supporting documents.",
  },
  {
    icon: "/images/product/icon-display-checklist.png",
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
  src: "/images/1024px-Microsoft_Outlook_logo_(2024–2025).svg 1.png",
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
    answer:
      "Sledge can connect to Microsoft Outlook and Office 365 inboxes, including shared AP mailboxes, distribution inboxes, and individual user accounts.",
  },
  {
    question: "Does Sledge read all of my Outlook emails?",
    answer:
      "No. Sledge only scans emails and attachments relevant to invoices and financial documents. Personal or unrelated emails are not processed.",
  },
  {
    question: "How does Sledge identify invoice emails in Outlook?",
    answer:
      "Sledge uses AI trained on construction invoices to detect invoice emails and attachments based on structure, context, and content — not simple keyword rules.",
  },
  {
    question: "Do I need to set up forwarding rules or folders?",
    answer:
      "No. Sledge connects directly to Outlook using secure authentication. No forwarding rules, no manual sorting, and no folder setup are required.",
  },
  {
    question: "What types of invoice attachments can Sledge read from Outlook?",
    answer: (
      <>
        Sledge supports common attachment types including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>PDF invoices</li>
          <li>Scanned documents</li>
          <li>Images and photos</li>
          <li>Multi-page invoice files</li>
        </ul>
      </>
    ),
  },
  {
    question: "What happens after an invoice email is found?",
    answer:
      "Sledge extracts invoice data, prepares it for approval, and presents it in the Sledge platform. Invoices only move forward after human approval.",
  },
  {
    question: "Can invoices be rejected if something is wrong?",
    answer:
      "Yes. Invoices can be rejected before approval. Rejected invoices are stopped and can trigger a response requesting correction.",
  },
  {
    question: "Can Sledge handle shared AP inboxes?",
    answer:
      "Yes. Sledge is designed to work with shared Outlook inboxes commonly used by construction accounting teams.",
  },
  {
    question: "Is my Outlook data secure?",
    answer:
      "Yes. Sledge uses secure OAuth authentication, encrypted data handling, and maintains audit trails for all invoice processing activities.",
  },
  {
    question: "Does Sledge work with Microsoft 365?",
    answer:
      "Yes. Sledge integrates with Microsoft 365 / Office 365 Outlook environments using secure, native connections.",
  },
  {
    question: "Can Sledge extract line items and totals from Outlook invoices?",
    answer:
      "Yes. Sledge reads and extracts line items, totals, dates, vendor details, and supporting documentation using AI.",
  },
  {
    question: "Is this built specifically for construction invoices?",
    answer:
      "Yes. Sledge is trained on construction-specific invoice formats, including material suppliers, equipment rentals, subcontractors, and service providers.",
  },
  {
    question: "Will Sledge replace my accounting software?",
    answer:
      "No. Sledge prepares invoice data from Outlook and syncs approved invoices into your accounting system — it does not replace accounting software.",
  },
  {
    question: "How long does it take to connect Outlook to Sledge?",
    answer:
      "Most teams can connect Outlook and begin capturing invoices within minutes.",
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
