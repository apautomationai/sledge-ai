"use client";

import { Header } from "@/components/landing/header";

import { Footer } from "@/components/landing/footer";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ } from "@/components/product/faq";
import { Tools } from "@/components/product/tools";
import { IntegrationWorking } from "@/components/product/integration-working";

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "Not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts.";

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
          <Tools />
          <IntegrationWorking />
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
