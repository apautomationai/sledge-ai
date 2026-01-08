import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

import { Video } from "@/components/product/video";
import { Testimonial } from "@/components/landing/testimonial";
import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ, FAQItem } from "@/components/product/faq";
import { AiAccount } from "@/components/product/account-payable";
import { HowItWorks } from "@/components/product/how-it-works";
import WhatSledgeAutomate from "@/components/product/what-sledge-automate";
import Benefits from "@/components/product/benefits";
import WhatIsIt from "@/components/landing/what-is-it";

export const metadata: Metadata = {
  title: "AI Accounts Payable Software for Construction | Invoice Automation",
  description:
    "Automate construction invoice processing with AI accounts payable software that captures, validates, routes, and syncs bills automatically.",
  openGraph: {
    title: "AI Accounts Payable Software for Construction | Invoice Automation",
    description:
      "Automate construction invoice processing with AI accounts payable software that captures, validates, routes, and syncs bills automatically.",
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
    title: "AI Accounts Payable Software for Construction | Invoice Automation",
    description:
      "Automate construction invoice processing with AI accounts payable software that captures, validates, routes, and syncs bills automatically.",
    images: ["/images/hero-visual.png"],
  },
};

const whatIsItTitle = "Autonomous AI Accounts Payable for Construction";
const whatIsItDescription =
  "Sledge’s AI runs continuously in the background. When an invoice arrives by email, AI automatically pulls the attachment, reads the invoice, recognizes fields and line items, and prepares it for approval — without user input.";
const whatIsItSubDescription =
  "Once approved, AI syncs everything into QuickBooks and logs the full history.";

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "Not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts.";

const faqs: FAQItem[] = [
  {
    question: "What is Sledge AI Accounts Payable?",
    answer:
      "Sledge AI Accounts Payable is an AI-powered accounts payable solution for construction that automates invoice intake, data extraction, approvals, and accounting sync — eliminating manual invoice processing and data entry.",
  },
  {
    question: "Who is Sledge AI Accounts Payable built for?",
    answer:
      "Sledge AI Accounts Payable is built for:",
    listItems: [
      "General contractors",
      "Trade and service contractors",
      "Construction office managers",
      "Accountants and bookkeepers",
    ],
    afterList:
      "Anyone responsible for processing, approving, or paying construction invoices will benefit.",
  },
  {
    question: "How does Sledge automate accounts payable with AI?",
    answer:
      "Sledge uses AI to automate the entire accounts payable workflow, including:",
    listItems: [
      "Automatically ingesting invoices",
      "Reading and parsing invoice data",
      "Extracting line items, totals, vendors, and job details",
      "Detecting duplicates and inconsistencies",
      "Routing invoices through approval and rejection workflows",
      "Syncing approved invoices directly into accounting software",
    ],
    afterList:
      "This removes manual work from AP while keeping teams in control.",
  },
  {
    question: "Does Sledge eliminate manual invoice processing and data entry?",
    answer:
      "Yes. Sledge is designed to eliminate manual invoice processing and repetitive data entry, significantly reducing admin time, errors, and accounting overhead in construction businesses.",
  },
  {
    question: "Do invoices still require human approval in Sledge?",
    answer:
      "Yes — always. Sledge automates the work, but humans stay in control. Invoices can be approved or rejected through clear workflows, and nothing is finalized or synced until it's reviewed and approved.",
  },
  {
    question: "How does Sledge capture invoices?",
    answer:
      "Sledge uses AI to scan your email inboxes and automatically capture invoices.",
    listItems: [
      "Connect Gmail and Outlook inboxes",
      "Sledge reads incoming emails, identifies invoices, and parses them automatically",
      "Users can also upload invoices manually if needed",
    ],
    afterList: "No more downloading, renaming, or forwarding files.",
  },
  {
    question: "What happens in Sledge if an invoice is incorrect or needs changes?",
    answer: "If an invoice is incorrect, Sledge allows you to:",
    listItems: [
      "Flag the issue",
      "Reject the invoice",
      "Leave comments for clarification",
      "Send it back for correction",
    ],
    afterList:
      "Nothing moves forward in Sledge until the invoice is accurate and approved, ensuring clean records and preventing payment errors.",
  },
  {
    question: "How does Sledge prevent duplicate invoices and double payments?",
    answer: "Sledge uses AI and validation checks to identify:",
    listItems: [
      "Duplicate invoice numbers",
      "Duplicate vendors",
      "Matching amounts and dates",
    ],
    afterList:
      "This helps prevent double payments and keeps your books clean.",
  },
  {
    question: "Can Sledge handle high invoice volume?",
    answer:
      "Yes. Sledge is built to handle high invoice volume without slowing down — whether you process dozens or thousands of invoices per month. Automation scales as your business grows.",
  },
  {
    question: "How is Sledge AI Accounts Payable different from traditional construction AP tools?",
    answer:
      "Traditional construction AP tools rely on manual data entry, complex workflows, and outdated interfaces that slow teams down. Sledge AI Accounts Payable is different:",
    listItems: [
      "AI-first, not manual-first",
      "Eliminates repetitive AP work instead of shifting it",
      "Simple, intuitive interface",
      "Fast setup with minimal configuration",
      "Built to reduce overhead and save hours every week",
    ],
    afterList:
      "Sledge modernizes accounts payable so construction teams can move faster with less effort.",
  },
];

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
        <FAQ faqs={faqs} />
      </main>
      <Footer />
    </div>
  );
}
