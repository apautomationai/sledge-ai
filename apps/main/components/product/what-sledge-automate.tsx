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
    <section className="w-full overflow-hidden py-12 md:py-16 px-6 md:px-8 lg:px-12">
      <div className="flex flex-col gap-8 items-center max-w-[1400px] mx-auto">
        <div className="w-full flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 text-white">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan'] mb-6">
              What Sledge Automates Today
            </h2>
            <p className="text-lg md:text-xl text-white mb-6">
              Sledge automates the full Accounts Payable lifecycle using
              autonomous AI. From invoice intake to accounting sync, AI executes
              the work automatically and waits only for approval when required.
            </p>
            <ul className="space-y-3 text-base md:text-xl text-white">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-white">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Image */}
          <div className="flex-1 flex justify-end">
            <Image
              src="/updated-images/image-sledge-to-accounts-payable-module-adjusted-2 1.png"
              alt="Sledge AI Accounts Payable automation workflow"
              width={588}
              height={588}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
