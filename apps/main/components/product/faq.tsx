"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const faqs = [
  {
    question: "What is Sledge?",
    answer:
      "Sledge is an AI-first construction back-office platform built to automate how work is captured, understood, and executed. It replaces manual invoice entry, inbox sorting, and disconnected accounting workflows with AI-powered automation — starting with accounts payable.",
  },
  {
    question: "Who is Sledge built for?",
    answer: (
      <>
        Sledge is built for construction teams that manage invoices, approvals, and accounting workflows, including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>General contractors</li>
          <li>Subcontractors</li>
          <li>Office managers</li>
          <li>Accountants and bookkeepers</li>
        </ul>
        <p className="mt-2">If your team deals with vendor invoices, email attachments, approvals, or accounting systems, Sledge is built for you.</p>
      </>
    ),
  },
  {
    question: "What problems does Sledge solve?",
    answer: (
      <>
        Sledge eliminates the most time-consuming and error-prone parts of construction back-office work, including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Manual invoice entry</li>
          <li>Sorting invoice emails and attachments</li>
          <li>Duplicate vendors and cost codes</li>
          <li>Approval bottlenecks</li>
          <li>Disconnected systems</li>
        </ul>
        <p className="mt-2">Sledge automates these steps while keeping humans in control.</p>
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
        <p className="mt-2">AI handles the repetitive work. Humans approve the results.</p>
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
        Sledge captures invoices from the places construction teams already receive them, including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Email inboxes (Gmail, Outlook, shared AP inboxes)</li>
          <li>Manual uploads</li>
        </ul>
        <p className="mt-2">AI identifies real invoices and ignores non-invoice documents automatically.</p>
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
    question: "How is Sledge different from construction management software like Procore or Buildertrend?",
    answer:
      "Sledge focuses on automating the construction back office — not project schedules or field management. It eliminates manual administrative work using AI while integrating with the tools construction teams already rely on.",
  },
  {
    question: "What is \"The Builder's AI Office\"?",
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

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative w-full px-6 md:px-8 lg:px-12 py-12 md:py-16 bg-[#141414]">
      <div className="relative mx-auto max-w-[1400px]">
        <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan'] text-center mb-8 sm:mb-10 md:mb-12">
          Frequently Asked Questions.
        </h2>

        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b border-neutral-700 last:border-b-0"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between py-4 sm:py-5 text-left group"
              >
                <span className="text-white text-base sm:text-lg md:text-xl font-semibold pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 text-amber-400 transition-transform duration-300 flex-shrink-0",
                    openIndex === index ? "rotate-180" : ""
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  openIndex === index ? "max-h-[600px] pb-4 sm:pb-5" : "max-h-0"
                )}
              >
                <div className="text-white text-xs sm:text-sm md:text-base leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
