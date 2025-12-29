"use client";

import Image from "next/image";
import Link from "next/link";

export default function Savings() {
  const annualSavings = 125000;
  const hoursPerYear = 500;

  return (
    <section className="w-full px-4 sm:px-8 md:px-16 lg:px-24 xl:px-48 py-16 inline-flex flex-col justify-center items-center gap-12">
      {/* Header */}
      <div className="self-stretch flex flex-col justify-start items-center gap-2">
        <div className="text-center text-white text-3xl sm:text-4xl lg:text-5xl font-bold font-league-spartan uppercase">
          Save Hours Every Week with AI Accounts Payable.
        </div>
        <div className="self-stretch text-center text-white text-lg sm:text-xl lg:text-2xl font-normal font-sans">
          This calculator estimates how much time and money your team can save
          by automating invoice processing with AI.
          <br className="hidden sm:block" />
          Results are based on common construction back-office workflows.
        </div>
      </div>

      {/* Content Grid */}
      <div className="self-stretch inline-flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 lg:gap-12 xl:gap-24">
        {/* Left Column - Input Form */}
        <div className="w-full max-w-96 shrink-0 p-6 sm:p-8 lg:p-12 bg-zinc-900 rounded-lg outline-1 -outline-offset-1 outline-neutral-700 inline-flex flex-col justify-start items-start gap-4">
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch text-white text-sm font-medium font-sans">
              Invoices per month
            </div>
            <div className="self-stretch h-11 relative bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 overflow-hidden">
              <div className="left-[16px] top-[14px] absolute text-neutral-100/50 text-sm font-medium font-sans">
                500
              </div>
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch text-white text-sm font-medium font-sans">
              Time spent per invoice
            </div>
            <div className="self-stretch h-11 relative bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 overflow-hidden">
              <div className="left-[16px] top-[14px] absolute text-neutral-100/50 text-sm font-medium font-sans">
                5 minutes
              </div>
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch text-white text-sm font-medium font-sans">
              Number of workers
            </div>
            <div className="self-stretch h-11 relative bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 overflow-hidden">
              <div className="left-[16px] top-[14px] absolute text-neutral-100/50 text-sm font-medium font-sans">
                3
              </div>
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            <div className="self-stretch text-white text-sm font-medium font-sans">
              Average hourly rate per worker
            </div>
            <div className="self-stretch h-11 relative bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 overflow-hidden">
              <div className="left-[16px] top-[14px] absolute text-neutral-100/50 text-sm font-medium font-sans">
                50
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="w-full max-w-96 shrink-0 inline-flex flex-col justify-center items-center gap-6">
          <div className="self-stretch text-center text-white text-sm font-normal font-sans leading-6">
            Estimated impact after automating payables with AI.
          </div>

          {/* Annual Savings */}
          <div className="w-full max-w-72 flex flex-col justify-start items-center gap-3">
            <div className="text-white text-xl sm:text-2xl font-medium font-sans">
              Annual Savings
            </div>
            <div className="self-stretch inline-flex justify-center items-center gap-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 relative overflow-hidden flex-shrink-0">
                <Image
                  src="/images/Vector.png"
                  alt="Savings icon"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-amber-400 text-3xl sm:text-4xl lg:text-5xl font-bold font-league-spartan">
                ${annualSavings.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Annual Time Saved */}
          <div className="w-full max-w-80 flex flex-col justify-start items-center gap-4">
            <div className="self-stretch text-center text-white text-xl sm:text-2xl font-medium font-sans">
              Annual Time Saved
            </div>
            <div className="self-stretch inline-flex justify-center items-center gap-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 relative overflow-hidden flex-shrink-0">
                <Image
                  src="/images/Vector (1).png"
                  alt="Time saved icon"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-amber-400 text-3xl sm:text-4xl lg:text-5xl font-bold font-league-spartan">
                {hoursPerYear.toLocaleString()} HOURS
              </div>
            </div>
          </div>

          <div className="self-stretch text-center text-zinc-400 text-xs font-medium font-sans">
            Estimates vary by workflow and volume. Actual savings depend on
            usage and approval patterns.
          </div>

          {/* CTA Buttons */}
          <div className="w-full flex flex-col justify-center items-center gap-4">
            <button className="self-stretch px-3 sm:px-4 py-3 bg-amber-400 hover:bg-amber-500 rounded inline-flex justify-center items-center gap-2 overflow-hidden transition-colors">
              <span className="cursor-pointer text-center text-stone-800 text-[11px] sm:text-sm md:text-base font-semibold uppercase leading-tight whitespace-nowrap">
                SEE HOW SLEDGE AUTOMATES PAYABLES
              </span>
            </button>

            <Link
              href="/sign-up"
              className="cursor-pointer self-stretch px-3 sm:px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded flex justify-center items-center gap-2 overflow-hidden transition-colors"
            >
              <span className="text-center text-zinc-100 text-[11px] sm:text-sm md:text-base font-bold font-sans uppercase leading-tight whitespace-nowrap">
                START A FREE TRIAL
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
