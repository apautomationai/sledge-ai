"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

export interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
  listItems?: string[];
  afterList?: string;
}

interface FAQProps {
  faqs: FAQItem[];
}

export function FAQ({ faqs }: FAQProps) {
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
                  openIndex === index ? "max-h-[800px] pb-4 sm:pb-5" : "max-h-0"
                )}
              >
                <div className="text-white text-xs sm:text-sm md:text-base leading-relaxed">
                  {faq.answer}
                  {faq.listItems && faq.listItems.length > 0 && (
                    <ul className="mt-3 space-y-2 list-disc list-inside pl-2">
                      {faq.listItems.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {faq.afterList && (
                    <p className="mt-3">{faq.afterList}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
