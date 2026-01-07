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
import { FAQ, FAQItem } from "@/components/product/faq";

const aiFoundationTitle = "How the AI Foundation Works";
const aiFoundationText =
  "These core AI capabilities power the platform today and serve as the base layer for the full Builder's AI Office.";
const aiFoundationSteps: Step[] = [
  {
    icon: "/images/icon-capture 1.svg",
    title: "1. Capture → AI Driven Intake",
    description:
      "AI automatically captures emails, documents, and attachments as they arrive.",
  },
  {
    icon: "/images/icon-understand 1.svg",
    title: "2. Understand → AI-Based Interpretation",
    description:
      "AI interprets unstructured data and maps it into structured business context.",
  },
  {
    icon: "/images/icon-complete 1.svg",
    title: "3. Execute → AI-Executed Workflows",
    description:
      "AI prepares work for completion and pauses for approval when required.",
  },
];

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "Not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts.";

const faqs: FAQItem[] = [
  {
    question: "What is Sledge?",
    answer:
      "Sledge is The Builder's AI Office — modern construction management software designed to automate the construction back office. Today, Sledge focuses on AI-powered accounts payable, with a broader vision to manage the entire construction office using AI at its core.",
  },
  {
    question: "Who is Sledge for?",
    answer: "Sledge is built for:",
    listItems: [
      "General Contractors",
      "Trade Contractors / Service Contractors",
      "Office Managers",
      "Accountants & Bookkeepers",
    ],
    afterList:
      "If you manage invoices, approvals, payments, or accounting for a construction business, Sledge is built for you.",
  },
  {
    question: "What does Sledge actually do today?",
    answer:
      "Today, Sledge is an AI-powered accounts payable platform for construction. Sledge:",
    listItems: [
      "Eliminates manual invoice processing and manual data entry",
      "Automatically ingests construction invoices",
      "Uses AI to read, parse, and extract invoice data",
      "Detects duplicates and costly errors",
      "Routes invoices for approval",
      "Syncs approved bills directly into accounting software",
    ],
    afterList:
      "This reduces overhead, saves hours every week, and removes admin work from the construction office.",
  },
  {
    question: "What industries is Sledge built for?",
    answer:
      "Sledge is built specifically for construction and concrete-focused businesses, including:",
    listItems: [
      "General construction",
      "Concrete contractors",
      "Specialty trade contractors",
      "Builder-led teams running active jobs",
    ],
    afterList:
      "Sledge is purpose-built for real construction workflows — not generic business software repackaged for the industry.",
  },
  {
    question: "How much does Sledge cost?",
    answer: "Sledge costs $299 per month with unlimited usage.",
    listItems: [
      "No setup fees",
      "No onboarding fees",
      "No per-project fees",
      "No percentage of your revenue",
    ],
    afterList:
      "While many construction management platforms charge thousands of dollars upfront and continue increasing costs as you grow, Sledge offers transparent, flat pricing so you keep your profits.",
  },
  {
    question: "Is Sledge free?",
    answer:
      "Sledge offers a 1-month free trial and a 100% money-back guarantee if you're not satisfied. You can run real invoices through the system and see results before committing.",
  },
  {
    question: "Is there a contract or long-term commitment with Sledge?",
    answer:
      "No long-term contracts. No lock-ins. Sledge is month-to-month, so you can subscribe or cancel anytime without complicated enterprise agreements or legal hoops.",
  },
  {
    question: "What does Sledge integrate with?",
    answer: "Sledge integrates with:",
    listItems: [
      "Gmail and Outlook inboxes for automatic invoice capture",
      "QuickBooks and other accounting software used in construction",
    ],
    afterList:
      "Invoices flow directly from inbox to approval to accounting — without manual handling.",
  },
  {
    question: "Does Sledge replace my accounting software?",
    answer:
      "No. Sledge complements your accounting software by automating invoice intake, approvals, and data entry — then syncing clean, accurate data into your books.",
  },
  {
    question: "How is Sledge different from other construction management software?",
    answer:
      "Most construction management software is bloated, expensive, and difficult to use — packed with complex interfaces, long onboarding cycles, and features teams never fully adopt. Sledge is different:",
    listItems: [
      "Built to reduce overhead and save hours of time",
      "Designed for simplicity and clarity, not complexity",
      "Streamlines construction paperwork end-to-end",
      "Easy for beginners, powerful for experienced builders",
      "Eliminates admin work instead of adding more steps",
    ],
    afterList:
      "Sledge delivers immediate value without weeks of training or costly setup.",
  },
];

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
        <FAQ faqs={faqs} />
        <Footer />
      </main>
    </div>
  );
}
