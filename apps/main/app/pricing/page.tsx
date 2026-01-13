import type { Metadata } from "next";
import { Header } from "@/components/landing/header";

import { Footer } from "@/components/landing/footer";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ, FAQItem } from "@/components/product/faq";
import { PricingCore } from "@/components/pricing/core";
import { PricingTools } from "@/components/pricing/tools";
import { WhatsIncluded } from "@/components/pricing/whats-included";
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

const moreComingTitle = "More Coming, At No Extra Cost.";
const moreComingText =
  "Sledge is starting with invoicing and payments, but we're building toward a complete construction back office.";
const moreComingFeatures = [
  {
    title: "Conditional & Unconditional Lien Waivers",
    description:
      "AI auto-generates, pre-fills, sends, tracks, and stores lien waivers each billing cycle using your invoices — reconciled automatically and signed faster.",
  },
  {
    title: "AIA G702 / G703 & Pay Packages",
    description:
      "AI builds complete pay apps and pay packages from your project data — schedules of values, invoices, lien waivers, and approvals included.",
  },
  {
    title: "Accounts Payable & Accounts Receivable",
    description:
      "AI manages vendor bills, subcontractor pay apps, owner billing, progress billing, and change orders — with automatic tracking of billing cycles, retainage, aging, and cash flow.",
  },
  {
    title: "Retention Management",
    description:
      "AI tracks retention across payables and receivables — managing withheld amounts, releases, and close-out automatically.",
  },
  {
    title: "Projects & Billing Cycles",
    description:
      "AI coordinates project billing, approvals, retainage, and payments — giving real-time visibility into what's billed, paid, and outstanding.",
  },
  {
    title: "The Builder's Back Office",
    description:
      "AI powers contracts, bidding, insurance tracking, time clocks, dispatch, scheduling, HR, legal, and business operations — all in one system.",
  },
];

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "Not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts.";

const whatIsItTitle = "Simple Pricing for Construction Teams";
const whatIsItDescription =
  "Construction software pricing is often complicated, unpredictable, and filled with hidden fees. Sledge offers one transparent plan so teams can automate their back office without worrying about per-invoice charges, user limits, or usage caps.";

export const metadata: Metadata = {
  title: "Construction Accounts Payable Software Pricing | Sledge",
  description:
    "Simple pricing for Sledge's AI-powered accounts payable software built for construction teams, with new workflows added over time.",
  openGraph: {
    title: "Construction Accounts Payable Software Pricing | Sledge",
    description:
      "Simple pricing for Sledge's AI-powered accounts payable software built for construction teams, with new workflows added over time.",
    images: [
      {
        url: "/images/hero-visual.png",
        width: 1200,
        height: 630,
        alt: "Sledge: The Builder's AI Office",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Construction Accounts Payable Software Pricing | Sledge",
    description:
      "Simple pricing for Sledge's AI-powered accounts payable software built for construction teams, with new workflows added over time.",
    images: ["/images/hero-visual.png"],
  },
};

const faqs: FAQItem[] = [
  {
    question: "How much does Sledge cost?",
    answer:
      "Sledge costs $299 per month. That's flat pricing with no tiers, no add-ons, and no surprise fees.",
  },
  {
    question: "What's included in Sledge's $299 plan?",
    answer: (
      <>
        The $299 plan includes:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>AI-powered accounts payable</li>
          <li>Unlimited invoice processing</li>
          <li>Email inbox integrations (Gmail & Outlook)</li>
          <li>Approval and rejection workflows</li>
          <li>Accounting integrations (including QuickBooks)</li>
          <li>Ongoing product updates</li>
        </ul>
        <p className="mt-2">Everything you need to automate AP — included.</p>
      </>
    ),
  },
  {
    question: "Are there any per-invoice, usage, or volume fees with Sledge?",
    answer: (
      <>
        No. Sledge does not charge:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Per invoice</li>
          <li>Per user</li>
          <li>Per project</li>
          <li>Based on revenue or volume</li>
        </ul>
        <p className="mt-2">Unlimited usage means unlimited usage.</p>
      </>
    ),
  },
  {
    question: "Is there a free trial for Sledge?",
    answer:
      "Yes. Sledge offers a 1-month free trial, so you can run real invoices through the system before paying.",
  },
  {
    question: "What happens if Sledge isn't a good fit for my business?",
    answer:
      "If Sledge isn't a good fit, you can cancel anytime. There's also a 100% money-back guarantee, so you're never locked into something that doesn't deliver value.",
  },
  {
    question: "Do I need to sign a long-term contract to use Sledge?",
    answer:
      "No. Sledge is month-to-month with no long-term contracts, no enterprise agreements, and no legal lock-ins. Subscribe or cancel anytime.",
  },
  {
    question: "Does Sledge pricing change based on company size or number of users?",
    answer: (
      <>
        No. Sledge pricing does not increase based on:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Company size</li>
          <li>Number of users</li>
          <li>Revenue</li>
          <li>Invoice volume</li>
        </ul>
        <p className="mt-2">The price stays the same as you grow.</p>
      </>
    ),
  },
  {
    question: "Are integrations included in Sledge's pricing?",
    answer:
      "Yes. All integrations — including email inboxes and accounting software — are included in the $299 monthly price. No extra fees to connect your tools.",
  },
  {
    question: "Will Sledge charge extra for future features?",
    answer:
      "Your subscription includes access to ongoing improvements and new features as Sledge expands the Builder's AI Office. If new, optional products are introduced in the future, they'll be clearly communicated — never hidden or forced.",
  },
  {
    question: "How does Sledge compare to other construction software pricing?",
    answer: (
      <>
        Most construction software charges:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>High setup or onboarding fees</li>
          <li>Per-user or per-project costs</li>
          <li>A percentage of your revenue</li>
          <li>Expensive long-term contracts</li>
        </ul>
        <p className="mt-2">
          Sledge offers simple, transparent, flat pricing because we believe
          software should help builders grow — not tax their success.
        </p>
      </>
    ),
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
          <WhatsIncluded
            title={moreComingTitle}
            text={moreComingText}
            features={moreComingFeatures}
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
