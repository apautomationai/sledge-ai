"use client";

import { Check } from "lucide-react";

const includedFeatures = [
  {
    left: "Unlimited AI invoice processing",
    right: "AI Automatic Email Listener",
  },
  {
    left: "Gmail, Outlook, & Quickbooks Integration",
    right: "Unlimited invoice projects",
  },
  {
    left: "No per-invoice fee",
    right: "No usage caps",
  },
];

export function WhatsIncluded() {
  return (
    <section className="py-4 md:py-4 lg:py-8 xl:py-16 2xl:py-16 px-4 sm:px-6 md:px-12 lg:px-20 ">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase mb-4">
            What's Included
          </h2>
          <p className="text-base sm:text-lg text-white max-w-2xl mx-auto">
            Built for real construction workflows, not generic accounting
            software.
          </p>
        </div>

        {/* Features Grid */}
        <div className="flex flex-col gap-4">
          {includedFeatures.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-[17px]"
            >
              {/* Left Feature */}
              <div className="flex items-center gap-3 bg-[#1B1A17] px-4 py-3 rounded">
                <Check className="w-5 h-5 text-[#e3b02f] shrink-0" />
                <span className="text-sm md:text-base lg:text-lg text-[#e3b02f]">
                  {row.left}
                </span>
              </div>

              {/* Right Feature */}
              <div className="flex items-center gap-3 bg-[#1B1A17] px-4 py-3 rounded">
                <Check className="w-5 h-5 text-[#e3b02f] shrink-0" />
                <span className="text-sm md:text-base lg:text-lg text-[#e3b02f]">
                  {row.right}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
