"use client";

import Link from "next/link";

export default function ReadyToRun() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-4 md:py-4 lg:py-8 xl:py-16 2xl:py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight sm:leading-tight md:leading-snug">
          READY TO RUN YOUR BUSINESS BETTER?
        </h2>
        <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl mb-8 leading-relaxed">
          No contracts. No setup fees. Connect to QuickBooks when you're ready.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/sign-up" className="w-full sm:w-auto">
            <div className="px-4 py-3 bg-amber-400 rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors duration-300">
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
    </section>
  );
}
