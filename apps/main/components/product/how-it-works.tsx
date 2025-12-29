"use client";

import Image from "next/image";

export function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white uppercase tracking-wide leading-tight sm:leading-tight md:leading-snug">
            How It Works
          </h2>
        </div>

        {/* Workflow Image */}
        <div className="flex justify-center">
          <Image
            src="/images/product/workflow-image 4.png"
            alt="How Sledge Works - AI Intake, AI Understanding, AI Routing, Human Review, 1-Click Sync"
            width={1344}
            height={672}
            className="object-contain w-full max-w-5xl"
            priority
          />
        </div>
      </div>
    </section>
  );
}
