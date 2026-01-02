import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const features = [
  "Unlimited AI invoice processing",
  "AI email listener and file ingestion",
  "AI invoice assignment",
  "AI project creation",
  "AI vendor/invoice assignment",
  "Unlimited invoice projects",
  "Gmail & Outlook integration",
  "QuickBooks integration",
  "No per-invoice fees",
  "No usage caps",
  "Cancel anytime",
];

export function PricingCore() {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <p className="text-sm md:text-md lg:text-lg text-gray-300">
            Construction Software Pricing | AI Back Office Tools – Sledge
          </p>
          <h2 className="mt-2 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase font-['League_Spartan']">
            One Plan.
            <br />
            Real Construction Back-Office Tools.
          </h2>
          <p className="mt-2 md:mt-2 text-lg lg:text-2xl text-white">
            Start with automated invoicing and payments today.
            <br />
            As we release more back-office tools, you'll already be in.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[468px] aspect-[468/706]">
            {/* Background Image */}
            <Image
              src="/images/Pricing Card.png"
              alt="Pricing Card Background"
              width={468}
              height={706}
              className="absolute inset-0 w-full h-full"
              priority
            />
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
              {/* Plan Name */}
              <h3 className="text-2xl sm:text-[32px] font-semibold font-sans text-[#e3b02f] text-center mb-2 sm:mb-3">
                Core
              </h3>

              {/* Price */}
              <div className="text-center mb-2 sm:mb-3">
                <span className="text-3xl sm:text-5xl font-bold text-[#e3b02f]">
                  $299
                </span>
                <span className="text-base sm:text-lg text-white">/month</span>
              </div>

              {/* Trial Info */}
              <div className="text-center mb-3 sm:mb-4">
                <p className="text-sm sm:text-[16px] font-semibold text-white">
                  1-Month Free Trial
                </p>
                <p className="text-sm sm:text-[16px] font-semibold text-white">
                  100% Money-Back Guarantee
                </p>
              </div>

              {/* CTA Button */}
              <Link
                href="/sign-up"
                className="w-full block text-center cursor-pointer bg-[#e3b02f] hover:bg-amber-500 text-black font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded transition-colors duration-200 mb-3 sm:mb-4 uppercase text-sm sm:text-[16px] tracking-wide"
              >
                Start Free Trial
              </Link>

              {/* Description */}
              <div className="mb-3 sm:mb-4">
                <p className="text-sm sm:text-[16px] text-white">
                  Ideal for growing businesses.
                  <br />
                  Advanced industry-leading capabilities.
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-1 sm:space-y-1.5 flex-1 overflow-hidden">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-[15px] text-white">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
