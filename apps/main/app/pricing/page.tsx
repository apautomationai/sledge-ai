"use client";

import { Header } from "@/components/landing/header";

import { Footer } from "@/components/landing/footer";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ, FAQItem } from "@/components/product/faq";
import { PricingCore } from "@/components/pricing/core";
import { PricingTools } from "@/components/pricing/tools";
import { WhatsIncluded } from "@/components/pricing/whats-included";
import { MoreComing } from "@/components/pricing/more";
import WhatIsIt from "@/components/landing/what-is-it";

const whatsIncludedTitle = "What's Included";
const whatsIncludedText =
  "Built for real construction workflows, not generic accounting software.";
const whatsIncludedFeatures = [
  "Unlimited AI invoice processing",
  "AI Automatic Email Listener",
  "Gmail, Outlook, & Quickbooks Integration",
  "Unlimited invoice projects",
  "No per-invoice fee",
  "No usage caps",
];

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "Not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts.";

const whatIsItTitle = "Simple Pricing for Construction Teams";
const whatIsItDescription =
  "Construction software pricing is often complicated, unpredictable, and filled with hidden fees. Sledge offers one transparent plan so teams can automate their back office without worrying about per-invoice charges, user limits, or usage caps.";

const faqs: FAQItem[] = [
  {
    question: "How much does Sledge cost?",
    answer:
      "Sledge offers one simple plan at $299 per month. The plan includes a 1-month free trial and a 100% money-back guarantee.",
  },
  {
    question: "What's included in the $299 plan?",
    answer: (
      <>
        The Core plan includes:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Unlimited AI invoice processing</li>
          <li>Automatic invoice capture from email</li>
          <li>AI data extraction and validation</li>
          <li>Human-in-the-loop approval workflows</li>
          <li>QuickBooks, Gmail, and Outlook integrations</li>
          <li>Unlimited invoice projects</li>
          <li>No per-invoice fees</li>
          <li>No usage caps</li>
        </ul>
        <p className="mt-2">Everything needed to automate construction accounts payable.</p>
      </>
    ),
  },
  {
    question: "Are there any per-invoice or usage fees?",
    answer:
      "No. Sledge does not charge per invoice, per document, or per transaction. There are no usage caps or overage fees.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Sledge includes a 1-month free trial so you can fully test the platform before paying.",
  },
  {
    question: "What happens if Sledge isn't a good fit?",
    answer:
      "Sledge offers a 100% money-back guarantee. If it doesn't meet your needs, you can cancel and get your money back.",
  },
  {
    question: "Do I need to sign a long-term contract?",
    answer:
      "No. Sledge does not require long-term contracts. You can cancel at any time.",
  },
  {
    question: "Does pricing change based on company size or number of users?",
    answer:
      "No. Pricing is not based on company size, user count, or invoice volume. One plan covers your entire team.",
  },
  {
    question: "Does Sledge replace my accounting software?",
    answer:
      "No. Sledge works with your accounting software. It automates invoice intake, approvals, and syncing — your accounting system remains the system of record.",
  },
  {
    question: "Are integrations included in the price?",
    answer:
      "Yes. Integrations with QuickBooks, Gmail, Outlook, and Stripe are included in the Core plan.",
  },
  {
    question: "Will I be charged for future features?",
    answer:
      "Your plan includes access to new back-office workflows as they're released, starting with Accounts Payable. Pricing changes, if any, will always be communicated clearly.",
  },
  {
    question: "How does Sledge compare to other construction software pricing?",
    answer:
      "Many construction tools charge per user, per invoice, or add hidden fees. Sledge offers one transparent price with unlimited usage, designed for construction back offices.",
  },
  {
    question: "How quickly can I get started?",
    answer:
      "Most teams can start using Sledge the same day they sign up. There's no complex setup or onboarding required.",
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
          <PricingCore />
          <WhatIsIt title={whatIsItTitle} description={whatIsItDescription} />
          <PricingTools />
          <WhatsIncluded
            title={whatsIncludedTitle}
            text={whatsIncludedText}
            features={whatsIncludedFeatures}
          />
          <MoreComing />
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
