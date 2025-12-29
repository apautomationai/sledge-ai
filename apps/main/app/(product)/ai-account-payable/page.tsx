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

export default function AiAccountPayable() {
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
          <AiAccount />
          <Video />
          <HowItWorks />
          <WhatSledgeAutomate />
          <Benefits />
          <Testimonial />
          <BuiltToRun />
        </div>
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
