"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function RoiCalculator() {
  const [invoicesPerMonth, setInvoicesPerMonth] = useState("500");
  const [timePerInvoice, setTimePerInvoice] = useState("5");
  const [numberOfWorkers, setNumberOfWorkers] = useState("3");
  const [hourlyRate, setHourlyRate] = useState("50");

  // Parse values to numbers for calculations
  const numInvoices = Number(invoicesPerMonth) || 0;
  const numTime = Number(timePerInvoice) || 0;
  const numWorkers = Number(numberOfWorkers) || 1;
  const numRate = Number(hourlyRate) || 0;

  // Hours in year = ((invoices per month x time per invoice) x 12) / number of workers
  const hoursPerYear = Math.round(
    (numInvoices * numTime * 12) / 60 / numWorkers,
  );

  // Money saved = number of workers * 8 * hourly rate * 5 * 4 * 12
  const annualSavings = numWorkers * 8 * numRate * 5 * 4 * 12;

  return (
    <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto flex flex-col justify-center items-center gap-12">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan']">
            Save Hours Every Week with AI Accounts Payable.
          </h2>
          <p className="mt-2 text-lg md:text-2xl text-white">
            This calculator estimates how much time and money your team can save
            by automating invoice processing with AI.
            <br className="hidden sm:block" />
            Results are based on common construction back-office workflows.
          </p>
        </div>

        {/* Content Grid */}
        <div className="self-stretch inline-flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 lg:gap-12 xl:gap-24">
          {/* Left Column - Input Form */}
          <div className="w-full md:max-w-80 lg:max-w-96 shrink-0 p-6 sm:p-8 md:p-8 lg:p-12 bg-zinc-900 rounded-lg outline-1 -outline-offset-1 outline-neutral-700 inline-flex flex-col justify-start items-start gap-4">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="self-stretch text-white text-sm font-medium font-sans">
                Invoices per month
              </div>
              <div className="self-stretch h-11 md:h-12 relative bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 overflow-hidden">
                <input
                  type="text"
                  value={invoicesPerMonth}
                  onChange={(e) =>
                    setInvoicesPerMonth(
                      e.target.value
                        .replace(/[^0-9]/g, "")
                        .replace(/^0+/, "") || "",
                    )
                  }
                  className="w-full h-full px-4 bg-transparent text-neutral-100 text-sm md:text-base font-medium font-sans outline-none"
                />
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="self-stretch text-white text-sm  font-medium font-sans">
                Time spent per invoice (minutes)
              </div>
              <div className="self-stretch h-11 md:h-12 relative bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 overflow-hidden">
                <input
                  type="text"
                  value={timePerInvoice}
                  onChange={(e) => {
                    const cleaned = e.target.value
                      .replace(/[^0-9]/g, "")
                      .replace(/^0+/, "") || "";
                    const numValue = Number(cleaned);
                    setTimePerInvoice(
                      numValue > 300 ? "300" : cleaned
                    );
                  }}
                  className="w-full h-full px-4 bg-transparent text-neutral-100 text-sm md:text-base font-medium font-sans outline-none"
                />
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="self-stretch text-white text-sm font-medium font-sans">
                Number of workers
              </div>
              <div className="self-stretch h-11 md:h-12 relative bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 overflow-hidden">
                <input
                  type="text"
                  value={numberOfWorkers}
                  onChange={(e) =>
                    setNumberOfWorkers(
                      e.target.value
                        .replace(/[^0-9]/g, "")
                        .replace(/^0+/, "") || "",
                    )
                  }
                  className="w-full h-full px-4 bg-transparent text-neutral-100 text-sm md:text-base font-medium font-sans outline-none"
                />
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="self-stretch text-white text-sm  font-medium font-sans">
                Average hourly rate per worker ($)
              </div>
              <div className="self-stretch h-11 md:h-12 relative bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 overflow-hidden">
                <input
                  type="text"
                  value={hourlyRate}
                  onChange={(e) =>
                    setHourlyRate(
                      e.target.value
                        .replace(/[^0-9]/g, "")
                        .replace(/^0+/, "") || "",
                    )
                  }
                  className="w-full h-full px-4 bg-transparent text-neutral-100 text-sm md:text-base font-medium font-sans outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="w-full md:max-w-80 lg:max-w-96 shrink-0">
            {/* Mobile Results Design */}
            <div className="md:hidden px-4 flex flex-col justify-center items-center gap-6">
              <div className="self-stretch text-center text-white text-sm  leading-6">
                Estimated impact after automating payables with AI.
              </div>

              {/* Annual Savings */}
              <div className="w-full max-w-72 flex flex-col justify-start items-center gap-3">
                <div className="text-white text-2xl font-medium font-sans">
                  Annual Savings
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-2">
                  <div className="relative overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/Vector.svg"
                      alt="Savings icon"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-[#e3b02f] text-3xl min-[375px]:text-5xl font-bold font-['League_Spartan']">
                    ${annualSavings.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Annual Time Saved */}
              <div className="w-full flex flex-col justify-start items-center gap-4">
                <div className="self-stretch text-center text-white text-2xl font-medium ">
                  Annual Time Saved
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-2">
                  <div className="relative overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/Frame.svg"
                      alt="Time saved icon"
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-[#e3b02f] text-3xl min-[375px]:text-5xl font-bold font-['League_Spartan']">
                    {hoursPerYear.toLocaleString()} HOURS
                  </div>
                </div>
              </div>

              <div className="self-stretch text-center text-white text-xs font-medium font-sans">
                Estimates vary by workflow and volume. Actual savings depend on
                usage and approval patterns.
              </div>

              {/* CTA Buttons */}
              <div className="self-stretch flex flex-col justify-center items-center gap-4">
                <Link
                  href="/product/ai-account-payable"
                  className="self-stretch px-2 min-[375px]:px-4 py-3 bg-[#e3b02f] hover:bg-amber-500 rounded inline-flex justify-center items-center gap-2 overflow-hidden transition-colors"
                >
                  <span className="text-center text-stone-800 text-[10px] min-[375px]:text-xs font-semibold font-sans uppercase leading-5 whitespace-nowrap">
                    SEE HOW SLEDGE AUTOMATES PAYABLES
                  </span>
                </Link>

                <Link
                  href="/sign-up"
                  className="cursor-pointer self-stretch px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded flex justify-center items-center gap-2 overflow-hidden transition-colors"
                >
                  <span className="text-center text-zinc-100 text-xs font-bold font-sans uppercase leading-5">
                    START A FREE TRIAL
                  </span>
                </Link>
              </div>
            </div>

            {/* Desktop Results Design */}
            <div className="hidden md:flex flex-col justify-center items-center gap-6">
              <div className="self-stretch text-center text-white text-sm font-normal font-sans leading-6">
                Estimated impact after automating payables with AI.
              </div>

              {/* Annual Savings */}
              <div className="w-full flex flex-col justify-start items-center gap-3">
                <div className="text-white text-xl lg:text-2xl font-medium font-sans">
                  Annual Savings
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-2">
                  <div className="relative overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/Vector.svg"
                      alt="Savings icon"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-[#e3b02f] text-3xl lg:text-5xl font-bold font-league-spartan">
                    ${annualSavings.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Annual Time Saved */}
              <div className="w-full flex flex-col justify-start items-center gap-4">
                <div className="self-stretch text-center text-white text-xl lg:text-2xl font-medium font-sans">
                  Annual Time Saved
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-2">
                  <div className="relative overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/Frame.svg"
                      alt="Time saved icon"
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-[#e3b02f] text-3xl lg:text-5xl font-bold font-league-spartan">
                    {hoursPerYear.toLocaleString()} HOURS
                  </div>
                </div>
              </div>

              <div className="self-stretch text-center text-white text-xs font-medium font-sans">
                Estimates vary by workflow and volume. Actual savings depend on
                usage and approval patterns.
              </div>

              {/* CTA Buttons */}
              <div className="w-full flex flex-col justify-center items-center gap-4">
                <Link
                  href="/product/ai-accounts-payable"
                  className="self-stretch px-4 py-3 bg-[#e3b02f] hover:bg-amber-500 rounded inline-flex justify-center items-center gap-2 overflow-hidden transition-colors"
                >
                  <span className="text-center text-stone-800 text-xs lg:text-base font-semibold uppercase leading-tight">
                    SEE HOW SLEDGE AUTOMATES PAYABLES
                  </span>
                </Link>

                <Link
                  href="/sign-up"
                  className="cursor-pointer self-stretch px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded flex justify-center items-center gap-2 overflow-hidden transition-colors"
                >
                  <span className="text-center text-zinc-100 text-xs lg:text-base font-bold font-sans uppercase leading-tight">
                    START A FREE TRIAL
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
