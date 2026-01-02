"use client";

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import BgImage from "@/public/images/background-image";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ } from "@/components/product/faq";
import { Hero } from "@/components/industries/hero";
import {
  AIFoundationWorking,
  Step,
} from "@/components/product/ai-foundation-working";
import { WhatsIncluded } from "@/components/pricing/whats-included";

const whatsIncludedTitle = "Why Concrete Contractors Choose Sledge";
const whatsIncludedText =
  "Built on an autonomous AI foundation designed for construction back-office workflows.";
const whatsIncludedFeatures = [
  "Built for high invoice volume and fast turnarounds",
  "AI-first automation — less manual entry, fewer mistakes",
  "Works with QuickBooks and existing email workflows",
  "No per-invoice fees or usage caps",
  "Designed for concrete margins, not office-heavy businesses",
];

const aiFoundationTitle =
  "Built for high-volume,fast-moving concrete operations";
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

const builtToRunTitle = "sEE IF SLEDGE FITS YOUR CONCRETE OPERATION";
const builtToRunSubtitle = "";
const builtToRunDescription =
  "Built on an autonomous AI foundation designed for construction back-office workflows.";

const heroSubtitle =
  "Construction Contractor Software | AI Back Office for Construction – Sledge";
const heroTitle = `POUR CONCRETE.
WE'LL HANDLE THE PAPERWORK.`;
const heroDescription =
  "AI-powered construction management software built for real jobs. Automate invoicing, payments, and back-office workflows without changing how construction teams operate.";
const heroImage = {
  src: "/images/industries/image-industry-concrete.png",
  alt: "Construction Management Software",
};

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
          <Hero
            subtitle={heroSubtitle}
            title={heroTitle}
            description={heroDescription}
            image={heroImage}
          />
          <AIFoundationWorking
            title={aiFoundationTitle}
            steps={aiFoundationSteps}
          />
          <WhatsIncluded
            title={whatsIncludedTitle}
            text={whatsIncludedText}
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
