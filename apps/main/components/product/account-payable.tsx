"use client";

import Link from "next/link";

export function AiAccount() {
  return (
    <section className="relative w-full px-6 md:px-8 lg:px-12 xl:px-32 py-12 md:py-16">
      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white uppercase leading-tight sm:leading-tight md:leading-snug">
            AI Accounts payable. done for you.
          </h2>

          <p className="mt-6 sm:mt-8 text-sm sm:text-base md:text-lg lg:text-xl text-white max-w-3xl mx-auto leading-relaxed">
            Sledge uses autonomous AI to capture invoices from email, parse and
            validate invoice data, route for human approval, and automatically
            sync approved bills into QuickBooks.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-[#E3B02F] rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors duration-300">
                <div className="text-center text-stone-800 text-sm sm:text-base font-bold font-['Inter'] uppercase leading-6">
                  start a free trial
                </div>
              </div>
            </Link>

            <Link href="#demo" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-zinc-800 rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-zinc-700 transition-colors duration-300">
                <div className="text-center text-zinc-100 text-sm sm:text-base font-bold font-['Inter'] uppercase leading-6">
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
