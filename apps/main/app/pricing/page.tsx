"use client";

import { Header } from "@/components/landing/header";

import { Footer } from "@/components/landing/footer";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ } from "@/components/product/faq";
import { PricingCore } from "@/components/pricing/core";
import { PricingTools } from "@/components/pricing/tools";
import { WhatsIncluded } from "@/components/pricing/whats-included";
import { MoreComing } from "@/components/pricing/more";

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
          <PricingTools />
          <WhatsIncluded />
          <MoreComing />
          <BuiltToRun />
        </div>
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
