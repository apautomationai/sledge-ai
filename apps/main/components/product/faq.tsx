"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const faqs = [
  {
    question: "Who should use Sledge?",
    answer:
      "Sledge is designed for construction companies, general contractors, subcontractors, and any builder looking to streamline their back-office operations. Whether you're managing a small team or a large operation, Sledge scales with your needs.",
  },
  {
    question: "How does Sledge capture invoices from my email?",
    answer:
      "Sledge connects securely to your email and automatically detects incoming invoices. Our AI extracts key data like vendor details, amounts, line items, and job codes — eliminating manual data entry and reducing errors.",
  },
  {
    question: "Can I pay vendors directly through Sledge?",
    answer:
      "Yes! Sledge integrates with your existing payment systems to enable direct vendor payments. You can review, approve, and pay invoices all from one platform, maintaining full control over your cash flow.",
  },
  {
    question:
      "What makes Sledge different from other construction management software?",
    answer:
      "Sledge is built AI-first, not AI-bolted-on. Our platform was designed from the ground up to automate construction back-office workflows, starting with accounts payable. This means faster processing, fewer errors, and more time for you to focus on building.",
  },
  {
    question: "Is Sledge secure?",
    answer:
      "Absolutely. Sledge uses bank-level encryption, secure cloud infrastructure, and follows industry best practices for data protection. Your financial data and business information are always protected.",
  },
  {
    question: "What if my business grows or I need to add more team members?",
    answer:
      "Sledge scales with your needs. You can upgrade tiers anytime and invite your team or subcontractors to collaborate with proper permissions.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-20 md:py-28 bg-neutral-900">
      <div className="relative mx-auto max-w-4xl xl:max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white uppercase leading-tight sm:leading-tight md:leading-snug text-center mb-8 sm:mb-10 md:mb-12">
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
                <span className="text-white text-sm sm:text-base md:text-lg font-medium pr-4">
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
                  openIndex === index ? "max-h-96 pb-4 sm:pb-5" : "max-h-0"
                )}
              >
                <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
