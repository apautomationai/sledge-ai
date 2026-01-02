"use client";

import { Header } from "@/components/landing/header";

import { Footer } from "@/components/landing/footer";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ } from "@/components/product/faq";
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
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
