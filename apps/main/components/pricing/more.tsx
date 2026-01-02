"use client";

import { Check } from "lucide-react";

const upcomingFeatures = [
  {
    left: {
      title: "Cash flow and reporting",
      description:
        "See what's been invoiced, what's been paid, and what's outstanding, so you can spot issues before they turn into cash flow problems.",
    },
    right: {
      title: "Lien waiver workflows",
      description:
        "Generate, track, and exchange conditional and unconditional lien waivers without chasing paperwork or risking compliance mistakes.",
    },
  },
  {
    left: {
      title: "AIA G702 / G703 support",
      description:
        "Create and manage AIA payment applications with accurate schedules of values, stored and tied to each project.",
    },
    right: {
      title: "Accounting and ERP integrations",
      description:
        "Generate, track, and exchange conditional and unconditional lien waivers without chasing paperwork or risking compliance mistakes.",
    },
  },
  {
    left: {
      title: "Pay Package Support",
      description:
        "Create clean, complete pay packages that speed up approvals and reduce payment delays.",
    },
    right: {
      title: "Accounts Receivable",
      description:
        "See who owes you what, track payment status in one place, and reduce time spent chasing invoices.",
    },
  },
];

export function MoreComing() {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase mb-3 sm:mb-4 font-['League_Spartan']">
            More Coming, At No Extra Cost.
          </h2>
          <p className="mt-2 text-base md:text-2xl text-white">
            Sledge is starting with invoicing and payments, but we're building
            toward a complete construction back office.
          </p>
        </div>

        {/* Features Grid */}
        <div className="flex flex-col gap-8">
          {upcomingFeatures.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-[17px]"
            >
              {/* Left Feature */}
              <div className="flex gap-3 bg-[#1B1A17] px-4 py-4 rounded">
                <Check className="w-5 h-5 text-[#e3b02f] shrink-0 mt-1" />
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-[#e3b02f] mb-2">
                    {row.left.title}
                  </h3>
                  <p className="text-sm lg:text-base text-white leading-relaxed">
                    {row.left.description}
                  </p>
                </div>
              </div>

              {/* Right Feature */}
              <div className="flex gap-3 bg-[#1B1A17] px-4 py-4 rounded">
                <Check className="w-5 h-5 text-[#e3b02f] shrink-0 mt-1" />
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-[#e3b02f] mb-2">
                    {row.right.title}
                  </h3>
                  <p className="text-sm lg:text-base text-white leading-relaxed">
                    {row.right.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
