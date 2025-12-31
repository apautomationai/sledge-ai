"use client";

import { Check } from "lucide-react";

export interface WhatsIncludedProps {
  title?: string;
  text?: string;
  features?: string[];
}

export function WhatsIncluded({ title, text, features }: WhatsIncludedProps) {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 xl:px-32 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {(title || text) && (
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase mb-3 sm:mb-4">
                {title}
              </h2>
            )}
            {text && (
              <p className="text-sm sm:text-base md:text-lg text-white max-w-2xl mx-auto px-2 sm:px-0">
                {text}
              </p>
            )}
          </div>
        )}

        {/* Features Grid */}
        {features && features.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-[#1B1A17] px-4 py-3 rounded"
              >
                <Check className="w-5 h-5 text-[#e3b02f] shrink-0" />
                <span className="text-sm md:text-base lg:text-lg text-[#e3b02f]">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
