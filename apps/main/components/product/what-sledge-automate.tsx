import Image from "next/image";

const features = [
  "AI email listener for invoice intake",
  "AI invoice parsing and field recognition",
  "AI formatting and validation",
  "Human-in-the-loop approval and rejection",
  "AI-powered QuickBooks bill creation",
  "Automated vendor, cost code, and customer mapping",
  "Full audit trail and status history",
];

export default function WhatSledgeAutomate() {
  return (
    <section className="py-4 md:py-4 lg:py-8 xl:py-16 2xl:py-16 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-center gap-8 sm:gap-12 xl:gap-20">
        {/* Left Content */}
        <div className="xl:flex-1">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight sm:leading-tight md:leading-snug mb-4 sm:mb-6">
            <span className="md:whitespace-nowrap">WHAT SLEDGE AUTOMATES</span>
            <span className="hidden md:inline"><br /></span>
            <span className="md:hidden"> </span>
            TODAY
          </h2>
          <p className="text-white text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-xl leading-relaxed">
            Sledge automates the full Accounts Payable lifecycle using
            autonomous AI. From invoice intake to accounting sync, AI executes
            the work automatically and waits only for approval when required.
          </p>
          <ul className="space-y-2 sm:space-y-3">
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start gap-2 sm:gap-3 text-white"
              >
                <span className="text-white mt-1 sm:mt-1.5">•</span>
                <span className="text-xs sm:text-sm md:text-base">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Image */}
        <div className="xl:flex-1 flex justify-center xl:justify-end">
          <Image
            src="/images/product/Frame 103.png"
            alt="Sledge AI Accounts Payable automation workflow"
            width={588}
            height={588}
            className="object-contain w-full max-w-[400px] sm:max-w-[500px] md:max-w-[588px]"
          />
        </div>
      </div>
    </section>
  );
}
