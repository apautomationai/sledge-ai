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
    question: "What is Sledge Accounts Payable?",
    answer:
      "Sledge Accounts Payable is an AI-powered system that automates how construction teams capture invoices, extract data, route approvals, and sync approved bills into their accounting system — without manual data entry.",
  },
  {
    question: "Who is Sledge Accounts Payable built for?",
    answer:
      "Sledge is built for construction teams that process vendor invoices, including general contractors, subcontractors, office managers, accountants, and bookkeepers.",
  },
  {
    question: "How does Sledge automate accounts payable?",
    answer:
      "Sledge uses AI to capture invoices, read and extract invoice data, understand line items, and prepare invoices for approval. Humans review and approve invoices before anything is finalized or synced.",
  },
  {
    question: "Do invoices still require human approval?",
    answer:
      "Yes. All invoices require human approval. AI prepares the work, but humans make the final decision before invoices move forward or sync into accounting.",
  },
  {
    question: "Does Sledge replace my accounting software?",
    answer:
      "No. Sledge works alongside your accounting system. It prepares and routes invoices for approval, then syncs approved bills into your accounting software, which remains the system of record.",
  },
  {
    question: "How does Sledge capture invoices?",
    answer:
      "Sledge captures invoices automatically from email inboxes and manual uploads. AI identifies real invoices and ignores non-invoice documents.",
  },
  {
    question: "What happens if an invoice is incorrect?",
    answer:
      "Incorrect invoices can be rejected during review. Rejected invoices are flagged and can be sent back for correction before approval.",
  },
  {
    question: "How does Sledge prevent duplicate vendors or records?",
    answer:
      "Sledge intelligently searches existing records to find close matches before creating anything new, preventing duplicate vendors, accounts, or cost codes.",
  },
  {
    question: "Can Sledge handle high invoice volume?",
    answer:
      "Yes. Sledge is designed to scale with construction invoice volume, allowing teams to process more invoices without adding back-office staff.",
  },
  {
    question: "Is Sledge secure?",
    answer:
      "Yes. Sledge uses secure authentication, permission-based access controls, and industry-standard security practices.",
  },
  {
    question: "Is Sledge built specifically for construction?",
    answer:
      "Yes. Sledge is designed for construction-specific invoice volume, approval workflows, and accounting requirements — not generic AP use cases.",
  },
  {
    question: "How long does it take to get started?",
    answer:
      "Most teams can connect their inboxes and begin processing invoices the same day. There is no long or complex setup required.",
  },
  {
    question: "Is there a long-term contract?",
    answer:
      "No. Sledge does not require long-term contracts. Teams can start, scale, and adapt as needed.",
  },
  {
    question: "How is Sledge different from traditional construction AP tools?",
    answer:
      "Traditional tools rely on manual entry and spreadsheets. Sledge uses AI to automate invoice processing while keeping humans in control of approvals and outcomes.",
  },
  {
    question: "What's included in the audit trail?",
    answer:
      "Every invoice includes its source, extracted data, approval history, timestamps, and execution status — creating a complete and traceable audit record.",
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
