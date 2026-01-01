"use client";

import { Header } from "@/components/landing/header";

import { Footer } from "@/components/landing/footer";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ } from "@/components/product/faq";
import { Hero } from "@/components/industries/hero";
import WhatIsIt from "@/components/landing/what-is-it";
import {
  AIFoundationWorking,
  Step,
} from "@/components/product/ai-foundation-working";

const aiFoundationTitle = "Construction Back Office Workflows, Automated";
const aiFoundationSteps: Step[] = [
  {
    icon: "/images/industries/icon-capture 1.png",
    title: "Invoice Management",
    description:
      "AI-powered invoice creation, tracking, and approvals across jobs.",
  },
  {
    icon: "/images/industries/icon-capture 2.png",
    title: "Lien Waivers",
    description:
      "Generate, track, and exchange lien waivers without paperwork risk.",
  },
  {
    icon: "/images/industries/icon-capture 3.png",
    title: "Vendor Management",
    description: "Centralize vendors, contracts, and documents in one system.",
  },
  {
    icon: "/images/industries/icon-capture 4.png",
    title: "Project Financials",
    description:
      "Real-time visibility into what's billed, paid, and outstanding.",
  },
];

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "Not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts.";

const heroSubtitle =
  "Construction Contractor Software | AI Back Office for Construction – Sledge";
const heroTitle = "CONSTRUCTION MANAGEMENT BUILT FOR REAL JOBS.";
const heroDescription =
  "AI-powered construction management software built for real jobs. Automate invoicing, payments, and back-office workflows without changing how construction teams operate.";
const heroImage = {
  src: "/images/industries/image-industry-construction.png",
  alt: "Construction Management Software",
};

const whatIsItTitle = "AI-Powered Back Office Software for Construction";
const whatIsItDescription =
  "Sledge is AI-powered back office software built for construction teams.It automates operational work like document intake, approvals, and accounting workflows using autonomous AI — reducing manual work without changing how teams operate.";

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
        <Hero
          subtitle={heroSubtitle}
          title={heroTitle}
          description={heroDescription}
          image={heroImage}
        />
        <WhatIsIt title={whatIsItTitle} description={whatIsItDescription} />
        <AIFoundationWorking
          title={aiFoundationTitle}
          steps={aiFoundationSteps}
        />
        <BuiltToRun
          title={builtToRunTitle}
          subtitle={builtToRunSubtitle}
          description={builtToRunDescription}
        />
      </main>
      <FAQ />
      <Footer />
    </div>
  );
}
