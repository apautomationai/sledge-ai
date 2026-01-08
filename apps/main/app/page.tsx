import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import WhatIsIt from "@/components/landing/what-is-it";
import IntegrationShowcase from "@/components/landing/integration-showcase";
import { Footer } from "@/components/landing/footer";
import SeeTheDifference from "@/components/landing/see-the-difference";
import ImportantTask from "@/components/landing/important-task";
import { BuiltToRun } from "@/components/product/built-to-run";
import { Cards } from "@/components/landing/cards";
import { Testimonial } from "@/components/landing/testimonial";
import RoiCalculator from "@/components/landing/roi-calculator";

export const metadata: Metadata = {
  title: "AI Accounts Payable Software for Construction | Sledge",
  description:
    "Sledge is an AI-powered accounts payable platform built for construction companies to automate invoice processing and back-office workflows.",
  openGraph: {
    title: "AI Accounts Payable Software for Construction | Sledge",
    description:
      "Sledge is an AI-powered accounts payable platform built for construction companies to automate invoice processing and back-office workflows.",
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
    title: "AI Accounts Payable Software for Construction | Sledge",
    description:
      "Sledge is an AI-powered accounts payable platform built for construction companies to automate invoice processing and back-office workflows.",
    images: ["/images/hero-visual.png"],
  },
};

const whatIsItTitle = "AI-Powered Back Office Software for Construction";
const whatIsItDescription =
  "Sledge is AI-powered back office software built for construction teams. It automates operational work like document intake, approvals, and accounting workflows using autonomous AI — reducing manual work without changing how teams operate.";
const builtToRunTitle = "READY TO RUN YOUR BUSINESS BETTER?";
const builtToRunDescription =
  "No contracts. No setup fees. Connect to QuickBooks when you're ready.";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <main className="flex flex-col">
        <Hero />
        <WhatIsIt title={whatIsItTitle} description={whatIsItDescription} />

        {/* Sections with fixed background */}
        <div className="relative">
          {/* Fixed background image */}
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

          {/* Scrollable content with background */}
          <div className="relative w-full">
            <IntegrationShowcase />
            <SeeTheDifference />
            <Cards />
            <RoiCalculator />
            <ImportantTask />
            <Testimonial />
            <BuiltToRun
              title={builtToRunTitle}
              description={builtToRunDescription}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
