"use client";

import Image from "next/image";

const steps = [
  {
    icon: "/images/product/icon-display-email-capture.png",
    number: "1",
    title: "Capture",
    subtitle: "AI Driven Intake",
    description:
      "AI automatically captures emails, documents, and attachments as they arrive.",
  },
  {
    icon: "/images/product/icon-display-ai-understand.png",
    number: "2",
    title: "Understand",
    subtitle: "AI-Based Interpretation",
    description:
      "AI interprets unstructured data and maps it into structured business context.",
  },
  {
    icon: "/images/product/icon-display-checklist.png",
    number: "3",
    title: "Execute",
    subtitle: "AI-Executed Workflows",
    description:
      "AI prepares work for completion and pauses for approval when required.",
  },
];

export function AIFoundationWorking() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white uppercase tracking-wide mb-3 sm:mb-4 leading-tight sm:leading-tight md:leading-snug">
            How the AI Foundation Works
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            These core AI capabilities power the platform today and serve as the
            base layer for the full Builder&apos;s AI Office.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 justify-items-center">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center w-full max-w-[432px] min-h-[380px] sm:min-h-[420px] md:h-[448px]"
            >
              {/* Icon */}
              <div className="w-[160px] h-[160px] sm:w-[190px] sm:h-[190px] md:w-[225px] md:h-[225px] mb-4 sm:mb-6 relative">
                <Image
                  src={step.icon}
                  alt={step.title}
                  width={225}
                  height={225}
                  className="object-contain w-full h-full"
                />
              </div>

              {/* Title with number */}
              <h3 className="text-[#E3B02F] text-base sm:text-lg md:text-xl font-semibold mb-1">
                {step.number}. {step.title} → {step.subtitle}
              </h3>

              {/* Description */}
              <p className="text-gray-400 text-xs sm:text-sm md:text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
