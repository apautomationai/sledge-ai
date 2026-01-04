"use client";

import { Header } from "@/components/landing/header";

import { Footer } from "@/components/landing/footer";

import { Video } from "@/components/product/video";
import { Testimonial } from "@/components/landing/testimonial";
import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ } from "@/components/product/faq";
import { AiAccount } from "@/components/product/account-payable";
import { HowItWorks } from "@/components/product/how-it-works";
import WhatSledgeAutomate from "@/components/product/what-sledge-automate";
import Benefits from "@/components/product/benefits";
import WhatIsIt from "@/components/landing/what-is-it";

const whatIsItTitle = "Autonomous AI Accounts Payable for Construction";
const whatIsItDescription =
  "Sledge’s AI runs continuously in the background. When an invoice arrives by email, AI automatically pulls the attachment, reads the invoice, recognizes fields and line items, and prepares it for approval — without user input.";
const whatIsItSubDescription =
  "Once approved, AI syncs everything into QuickBooks and logs the full history.";

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "Not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts.";

export default function AiAccountPayable() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Header />
      <main className="flex flex-col w-full">
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
          <AiAccount />
          <Video />
          <WhatIsIt
            title={whatIsItTitle}
            description={whatIsItDescription}
            subDescription={whatIsItSubDescription}
          />

          <HowItWorks />
          <WhatSledgeAutomate />
          <Benefits />
          <Testimonial />
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
