"use client";

import Link from "next/link";

export function MeetSledge() {
  return (
    <section className="relative py-20 md:py-28 ">
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-bold font-league-spartan tracking-tight text-white uppercase leading-none">
            Meet Sledge.
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-[64px] font-bold font-league-spartan tracking-tight text-white uppercase leading-none -mt-1 lg:-mt-2">
            The Builder&apos;s AI Office.
          </h3>

          <p className="mt-6 lg:mt-8 text-base sm:text-lg md:text-xl lg:text-[24px] font-normal font-sans text-gray-300 mx-auto leading-relaxed">
            An AI-first construction back-office platform, built from the ground
            up to automate how work is captured, understood, and executed —
            starting with Accounts Payable.
          </p>

          <p className="mt-6 text-[16px] font-normal font-sans text-[#B1B1B1]">
            The AI foundation is live today. The full AI office is what
            we&apos;re building toward.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-amber-400 rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors duration-300">
                <div className="text-center text-stone-800 text-base font-bold font-['Inter'] uppercase leading-6">
                  start a free trial
                </div>
              </div>
            </Link>

            <Link href="#demo" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-zinc-800 rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-zinc-700 transition-colors duration-300">
                <div className="text-center text-zinc-100 text-base font-bold font-['Inter'] uppercase leading-6">
                  WATCH HOW IT WORKS
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
