import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";

import { BuiltToRun } from "@/components/product/built-to-run";
import { FAQ, FAQItem } from "@/components/product/faq";
import { Tools } from "@/components/product/tools";
import { WhatsIncluded } from "@/components/pricing/whats-included";

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
  "Connect Sledge to your existing tools and let AI handle the work.";

const faqs: FAQItem[] = [
  {
    question: "What tools does Sledge integrate with?",
    answer: (
      <>
        Sledge integrates with the tools construction teams already use,
        including:
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Gmail and Outlook for invoice intake</li>
          <li>QuickBooks for accounting and bill sync</li>
        </ul>
        <p className="mt-2">
          Additional integrations are actively being built as Sledge expands
          across the builder back office.
        </p>
      </>
    ),
  },
  {
    question: "Do I need to change my existing tools to use Sledge integrations?",
    answer:
      "No. Sledge is designed to work alongside your existing tools, not replace them. You can keep your current email, accounting software, and workflows while Sledge automates the manual work between them.",
  },
  {
    question: "How do Sledge integrations work?",
    answer: (
      <>
        Sledge connects securely to your tools and acts as an automation layer.
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Data flows into Sledge for AI processing</li>
          <li>Approvals and validation happen inside Sledge</li>
          <li>Only approved, clean data syncs back to connected systems</li>
        </ul>
        <p className="mt-2">You stay in control at every step.</p>
      </>
    ),
  },
  {
    question: "Are Sledge integrations secure?",
    answer:
      "Yes. Sledge uses secure authentication and modern security best practices to connect to your tools. Data is accessed only to perform the actions you explicitly allow.",
  },
  {
    question: "Does Sledge automatically sync data, or do humans approve it first?",
    answer:
      "Humans approve it first. Sledge automates data capture and processing, but nothing syncs automatically without approval. This ensures accuracy, visibility, and control over what enters your accounting system.",
  },
  {
    question: "Can Sledge connect shared inboxes or multiple accounts?",
    answer:
      "Yes. Sledge supports connecting shared inboxes, multiple email accounts, and multiple data sources, making it easy to centralize invoices across teams, jobs, or entities.",
  },
  {
    question: "What happens in Sledge if data doesn't match between systems?",
    answer:
      "If Sledge detects inconsistencies or missing data, the item is flagged for review. You can correct it inside Sledge before anything syncs, preventing errors from spreading across systems.",
  },
  {
    question: "Do Sledge integrations sync in real time?",
    answer:
      "Sledge syncs data as soon as it's approved. This keeps connected systems up to date without syncing incomplete or incorrect information.",
  },
  {
    question: "Can I enable or disable Sledge integrations at any time?",
    answer:
      "Yes. You can enable, pause, or disable Sledge integrations at any time without disrupting your data or workflows.",
  },
  {
    question: "Is Sledge limited to only these integrations?",
    answer:
      "No. Sledge is built as an extensible platform, with additional integrations planned as it expands across accounting, operations, and the broader construction office.",
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
