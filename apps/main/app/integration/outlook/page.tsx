"use client";

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { IntegrationHero } from "@/components/integration/hero";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ } from "@/components/product/faq";
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
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
