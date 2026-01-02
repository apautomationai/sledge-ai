"use client";

import Link from "next/link";

interface BuiltToRunProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export function BuiltToRun({ title, subtitle, description }: BuiltToRunProps) {
  return (
    <section className="relative w-full px-6 md:px-8 lg:px-12 xl:px-32 py-12 md:py-16">
      <div className="relative w-full">
        <div className="text-center">
          {title && (
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase leading-tight sm:leading-tight md:leading-snug">
              {title}
            </h2>
          )}
          {subtitle && (
            <h3 className="mt-1 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase leading-tight sm:leading-tight md:leading-snug">
              {subtitle}
            </h3>
          )}
          {description && (
            <p className="mt-6 sm:mt-8 text-sm sm:text-base md:text-lg lg:text-xl text-white max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-[#e3b02f] rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors duration-300">
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
