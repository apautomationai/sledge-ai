"use client";

import { Header } from "@/components/landing/header";

import { Footer } from "@/components/landing/footer";

import { MeetSledge } from "@/components/product/meet-sledge";
import { Video } from "@/components/product/video";
import { Foundation } from "@/components/product/foundation";
import {
  AIFoundationWorking,
  Step,
} from "@/components/product/ai-foundation-working";
import { Expanding } from "@/components/product/expanding";
import { AiOffice } from "@/components/product/ai-office";
import { SledgeFor } from "@/components/product/sledge-for";
import { Testimonial } from "@/components/landing/testimonial";
import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ } from "@/components/product/faq";

const aiFoundationTitle = "How the AI Foundation Works";
const aiFoundationText =
  "These core AI capabilities power the platform today and serve as the base layer for the full Builder's AI Office.";
const aiFoundationSteps: Step[] = [
  {
    icon: "/updated-images/icon-display-email-capture.png",
    title: "1. Capture → AI Driven Intake",
    description:
      "AI automatically captures emails, documents, and attachments as they arrive.",
  },
  {
    icon: "/updated-images/icon-display-ai-understand.png",
    title: "2. Understand → AI-Based Interpretation",
    description:
      "AI interprets unstructured data and maps it into structured business context.",
  },
  {
    icon: "/updated-images/icon-display-checklist.png",
    title: "3. Execute → AI-Executed Workflows",
    description:
      "AI prepares work for completion and pauses for approval when required.",
  },
];

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "Not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts.";

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

        <MeetSledge />
        <Video />
        <Foundation />
        <AIFoundationWorking
          title={aiFoundationTitle}
          text={aiFoundationText}
          steps={aiFoundationSteps}
        />
        <Expanding />
        <AiOffice />
        <SledgeFor />
        <Testimonial />

        <BuiltToRun
          title={builtToRunTitle}
          subtitle={builtToRunSubtitle}
          description={builtToRunDescription}
        />
        <FAQ />
        <Footer />
      </main>
    </div>
  );
}
