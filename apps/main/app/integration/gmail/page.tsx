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
    icon: "/images/product/icon-display-email-capture.png",
    title: "1. Securely Connects to Your Gmail Inbox",
    description: "Secure Gmail integration for your AP and invoice inboxes.",
  },
  {
    icon: "/images/product/icon-understand 1.png",
    title: "2. AI Scans Emails to Find Invoices",
    description: "AI scans Gmail to detect invoice emails and attachments.",
  },
  {
    icon: "/images/product/icon-understand 2.png",
    title: "3. AI Reads and Extracts Invoice Data",
    description:
      "AI invoice processing extracts key invoice data automatically.",
  },
  {
    icon: "/images/product/icon-display-checklist.png",
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
  src: "/images/product/128px-Gmail_icon_(2020).svg 1.png",
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
    answer:
      "Sledge can connect to any Gmail inbox used for accounts payable, invoices, or vendor communications — including shared AP inboxes and individual Gmail accounts.",
  },
  {
    question: "Does Sledge read all of my emails?",
    answer:
      "No. Sledge only scans emails and attachments relevant to invoices. It does not read personal emails or unrelated messages, and it only processes data needed for invoice capture and automation.",
  },
  {
    question: "How does Sledge know which emails are invoices?",
    answer:
      "Sledge uses AI to identify invoice-related emails and attachments based on content, structure, and patterns common to construction invoices — not simple keyword matching.",
  },
  {
    question: "What types of invoice attachments can Sledge read?",
    answer: (
      <>
        Sledge can read common invoice formats including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>PDFs</li>
          <li>Scanned documents</li>
          <li>Images and photos</li>
          <li>Multi-page invoice attachments</li>
        </ul>
      </>
    ),
  },
  {
    question: "Can Sledge capture invoices without forwarding emails?",
    answer:
      "Yes. Sledge connects directly to Gmail using a secure integration, so no forwarding rules or manual downloads are required.",
  },
  {
    question: "What happens after Sledge finds an invoice email?",
    answer:
      "Sledge extracts the invoice data, prepares it for approval, and presents it in the Sledge platform. Nothing moves forward without human review and approval.",
  },
  {
    question: "Can invoices be rejected if they're incorrect?",
    answer:
      "Yes. Invoices can be rejected before approval. Rejected invoices are stopped from moving forward and can trigger a response requesting correction.",
  },
  {
    question: "Does Sledge work with multiple Gmail inboxes?",
    answer:
      "Yes. You can connect multiple inboxes if needed to support different teams, projects, or vendor workflows.",
  },
  {
    question: "Is my Gmail data secure?",
    answer:
      "Yes. Sledge uses secure OAuth connections and encrypted data handling. Sledge does not store unnecessary email content and maintains audit trails for invoice processing.",
  },
  {
    question: "Can Sledge extract invoice line items and totals?",
    answer:
      "Yes. Sledge reads and extracts line items, totals, dates, vendor details, and supporting documentation using AI.",
  },
  {
    question: "Is this built specifically for construction invoices?",
    answer:
      "Yes. Sledge is trained on construction-specific invoices, including material suppliers, equipment rentals, subcontractors, and service providers.",
  },
  {
    question: "Will Sledge replace my accounting software?",
    answer:
      "No. Sledge prepares invoices from Gmail and sends approved data into your accounting system — it does not replace accounting software.",
  },
  {
    question: "How quickly can I start using the Gmail integration?",
    answer:
      "Most teams can connect Gmail and start capturing invoices in just a few minutes.",
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
