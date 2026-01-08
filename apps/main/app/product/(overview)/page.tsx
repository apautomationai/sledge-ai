import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "AI Construction Back-Office Software | Accounts Payable & More",
  description:
    "Sledge is an AI-first construction back-office platform automating how work is captured, understood, and executed — starting with accounts payable.",
  openGraph: {
    title: "AI Construction Back-Office Software | Accounts Payable & More",
    description:
      "Sledge is an AI-first construction back-office platform automating how work is captured, understood, and executed — starting with accounts payable.",
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
    title: "AI Construction Back-Office Software | Accounts Payable & More",
    description:
      "Sledge is an AI-first construction back-office platform automating how work is captured, understood, and executed — starting with accounts payable.",
    images: ["/images/hero-visual.png"],
  },
};

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

const faqs: FAQItem[] = [
  {
    question: "What is Sledge?",
    answer:
      "Sledge is an AI-first construction back-office platform built to automate how work is captured, understood, and executed. It replaces manual invoice entry, inbox sorting, and disconnected accounting workflows with AI-powered automation — starting with accounts payable.",
  },
  {
    question: "Who is Sledge built for?",
    answer: (
      <>
        Sledge is built for construction teams that manage invoices, approvals,
        and accounting workflows, including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>General contractors</li>
          <li>Subcontractors</li>
          <li>Office managers</li>
          <li>Accountants and bookkeepers</li>
        </ul>
        <p className="mt-2">
          If your team deals with vendor invoices, email attachments, approvals,
          or accounting systems, Sledge is built for you.
        </p>
      </>
    ),
  },
  {
    question: "What problems does Sledge solve?",
    answer: (
      <>
        Sledge eliminates the most time-consuming and error-prone parts of
        construction back-office work, including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Manual invoice entry</li>
          <li>Sorting invoice emails and attachments</li>
          <li>Duplicate vendors and cost codes</li>
          <li>Approval bottlenecks</li>
          <li>Disconnected systems</li>
        </ul>
        <p className="mt-2">
          Sledge automates these steps while keeping humans in control.
        </p>
      </>
    ),
  },
  {
    question: "Is Sledge construction-specific or general accounting software?",
    answer:
      "Sledge is built specifically for construction workflows. Unlike generic accounting or project management software, Sledge understands construction invoices, approval processes, and back-office complexity — and is designed to work alongside tools construction teams already use.",
  },
  {
    question: "Does Sledge replace my accounting software?",
    answer:
      "No. Sledge works with your existing accounting system. It prepares, validates, and routes data so your accounting system stays clean and accurate without manual entry.",
  },
  {
    question: "How does Sledge use AI?",
    answer: (
      <>
        Sledge uses AI to:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Detect invoices from email and uploads</li>
          <li>Read and extract invoice data</li>
          <li>Match vendors, cost codes, and accounts</li>
          <li>Prepare structured data for approvals</li>
        </ul>
        <p className="mt-2">
          AI handles the repetitive work. Humans approve the results.
        </p>
      </>
    ),
  },
  {
    question: "Are humans still involved, or is everything automated?",
    answer:
      "Humans are always in control. Sledge uses AI to prepare work, but invoices must be approved before moving forward. Nothing is blindly automated into accounting systems without human review.",
  },
  {
    question: "How accurate is the AI?",
    answer:
      "Sledge combines AI automation with human-in-the-loop approvals to ensure accuracy. AI prepares the data, and users review and approve it before execution. This ensures speed without sacrificing control or trust.",
  },
  {
    question: "How does Sledge capture invoices?",
    answer: (
      <>
        Sledge captures invoices from the places construction teams already
        receive them, including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Email inboxes (Gmail, Outlook, shared AP inboxes)</li>
          <li>Manual uploads</li>
        </ul>
        <p className="mt-2">
          AI identifies real invoices and ignores non-invoice documents
          automatically.
        </p>
      </>
    ),
  },
  {
    question: "What happens if an invoice is incorrect?",
    answer:
      "If an invoice is incorrect, users can reject it during review. Rejected invoices are flagged and can be sent back for correction before approval.",
  },
  {
    question: "How does Sledge prevent duplicate vendors or records?",
    answer:
      "Sledge intelligently searches existing records to find close matches before creating anything new. This prevents duplicate vendors, customers, or cost codes and keeps systems clean over time.",
  },
  {
    question: "Is Sledge secure?",
    answer:
      "Yes. Sledge uses industry-standard security practices, secure authentication, and permission-based access controls. Users control which systems and inboxes Sledge can access at all times.",
  },
  {
    question: "How long does it take to get started?",
    answer:
      "Most teams can connect their inboxes and systems and start processing invoices the same day. There is no complex setup or long onboarding required.",
  },
  {
    question: "Can Sledge scale as my business grows?",
    answer:
      "Yes. Sledge is designed to scale with your invoice volume, team size, and operational complexity — without requiring more manual work or additional back-office staff.",
  },
  {
    question:
      "How is Sledge different from construction management software like Procore or Buildertrend?",
    answer:
      "Sledge focuses on automating the construction back office — not project schedules or field management. It eliminates manual administrative work using AI while integrating with the tools construction teams already rely on.",
  },
  {
    question: 'What is "The Builder\'s AI Office"?',
    answer:
      "The Builder's AI Office is Sledge's long-term vision: an AI-powered platform that automates construction back-office workflows end-to-end. Accounts payable is the starting point, with additional workflows expanding over time.",
  },
  {
    question: "Is there a contract or long-term commitment?",
    answer:
      "No. Sledge is designed to be easy to start and easy to scale — without long-term contracts.",
  },
  {
    question: "How do I get started?",
    answer:
      "You can start a free trial or schedule a demo to see how Sledge works for your construction workflows.",
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
