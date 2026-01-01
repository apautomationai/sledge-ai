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
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
