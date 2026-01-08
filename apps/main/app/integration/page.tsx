import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ, FAQItem } from "@/components/product/faq";
import { Tools } from "@/components/product/tools";
import { WhatsIncluded } from "@/components/pricing/whats-included";

export const metadata: Metadata = {
  title: "Construction Accounting Software Integrations | Sledge",
  description:
    "Connect Sledge with the accounting, email, and finance tools construction teams already use to automate accounts payable workflows.",
  openGraph: {
    title: "Construction Accounting Software Integrations | Sledge",
    description:
      "Connect Sledge with the accounting, email, and finance tools construction teams already use to automate accounts payable workflows.",
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
    title: "Construction Accounting Software Integrations | Sledge",
    description:
      "Connect Sledge with the accounting, email, and finance tools construction teams already use to automate accounts payable workflows.",
    images: ["/images/hero-visual.png"],
  },
};

const whatsIncludedTitle = "How Sledge Integrations Work";
const whatsIncludedText =
  "Sledge integrations are powered by autonomous, event-driven AI. When data enters one system — like an email or accounting platform — AI automatically processes, validates, and syncs information across your back office.";
const whatsIncludedFeatures = [
  "Secure, native API connections",
  "AI-driven data mapping and validation",
  "Continuous or near-real-time sync",
  "Human-in-the-loop control",
];

const builtToRunTitle = "Built to run your back office.";
const builtToRunSubtitle = "Not just invoices.";
const builtToRunDescription =
  "Designed for construction teams and how you work. No contracts.";

const faqs: FAQItem[] = [
  {
    question: "What tools does Sledge integrate with?",
    answer:
      "Sledge integrates with accounting, email, and payment tools commonly used by construction teams, including QuickBooks, Gmail, Outlook, and Stripe. New integrations are added continuously as the Builder's AI Office expands.",
  },
  {
    question: "Do I need to change my existing tools to use Sledge?",
    answer:
      "No. Sledge is designed to work with the tools you already use. Integrations allow Sledge to automate work across your existing systems without changing your accounting software, email inboxes, or payment platforms.",
  },
  {
    question: "How do Sledge integrations work?",
    answer:
      "Sledge integrations use secure, native API connections and AI-driven processing. When data enters one system — such as an invoice arriving by email or a payment in Stripe — AI automatically processes, validates, and routes that information across your back office.",
  },
  {
    question: "Are Sledge integrations secure?",
    answer:
      "Yes. All integrations use secure authentication, permission-based access, and industry-standard security practices. You control which systems Sledge can access at all times.",
  },
  {
    question:
      "Does Sledge automatically sync data, or do humans still approve it?",
    answer:
      "Sledge uses AI to prepare and map data, but humans stay in control. Critical actions — such as invoice approvals or accounting syncs — require human review before execution.",
  },
  {
    question: "Can I connect shared inboxes or multiple accounts?",
    answer:
      "Yes. Sledge supports connecting shared inboxes and multiple accounts depending on the integration, allowing teams to centralize back-office workflows across locations or departments.",
  },
  {
    question: "What happens if data doesn't match between systems?",
    answer:
      "Sledge intelligently searches for close matches before creating anything new. If something doesn't match, it's flagged for review so duplicates and errors are avoided.",
  },
  {
    question: "Do integrations sync in real time?",
    answer:
      "Most integrations sync continuously or near real time, ensuring data stays up to date without manual refreshes or exports.",
  },
  {
    question: "Can I enable or disable integrations at any time?",
    answer:
      "Yes. Integrations can be connected, adjusted, or disconnected at any time based on your business needs.",
  },
  {
    question: "Is Sledge limited to just these integrations?",
    answer:
      "No. These integrations represent the foundation of the Builder's AI Office. Additional accounting, finance, and operational integrations will be added over time.",
  },
  {
    question: "Where can I learn more about each integration?",
    answer:
      "Each integration has its own detailed page explaining exactly how it works, what data is used, and how it fits into your workflow.",
  },
];

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
          <WhatsIncluded
            title={whatsIncludedTitle}
            text={whatsIncludedText}
            features={whatsIncludedFeatures}
          />
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
