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
import WhatIsIt from "@/components/landing/what-is-it";

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
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
