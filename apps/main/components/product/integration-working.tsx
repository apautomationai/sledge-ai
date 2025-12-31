"use client";

import { Check } from "lucide-react";

const features = [
  "Secure, native API connections",
  "AI-driven data mapping and validation",
  "Continuous or near-real-time sync",
  "Human-in-the-loop control",
];

export function IntegrationWorking() {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 xl:px-32 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white uppercase tracking-wide mb-3 sm:mb-4 leading-tight sm:leading-tight md:leading-snug">
            How Sledge Integrations Work
          </h2>
          <p className="text-white text-sm sm:text-base md:text-lg max-w-4xl mx-auto leading-relaxed">
            Sledge integrations are powered by autonomous, event-driven AI. When
            data enters one system — like an email or accounting platform — AI
            automatically processes, validates, and syncs information across
            your back office.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 sm:gap-4">
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-[#E3B02F] shrink-0" />
              <span className="text-[#E3B02F] text-sm sm:text-base md:text-lg font-medium">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
