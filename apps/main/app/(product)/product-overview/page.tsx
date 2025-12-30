"use client";

import { Header } from "@/components/landing/header";

import { Footer } from "@/components/landing/footer";

import { MeetSledge } from "@/components/product/meet-sledge";
import { Video } from "@/components/product/video";
import { Foundation } from "@/components/product/foundation";
import { AIFoundationWorking } from "@/components/product/ai-foundation-working";
import { Expanding } from "@/components/product/expanding";
import { AiOffice } from "@/components/product/ai-office";
import { SledgeFor } from "@/components/product/sledge-for";
import { Testimonial } from "@/components/landing/testimonial";
import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ } from "@/components/product/faq";

export default function ProductOverview() {
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
          <MeetSledge />
          <Video />
          <Foundation />
          <AIFoundationWorking />
          <Expanding />
          <AiOffice />
          <SledgeFor />
          <Testimonial />
          <BuiltToRun />
        </div>
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
