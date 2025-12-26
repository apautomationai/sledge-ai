"use client";
import { TrialButton } from "./trial-button";
import { WatchDemoButton } from "./watch-demo-button";

export default function ReadyToRun() {
  return (
    <section className="bg-[#1a1a1a] py-20 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          READY TO RUN YOUR BUSINESS BETTER?
        </h2>
        <p className="text-gray-300 text-lg mb-8">
          No contracts. No setup fees. Connect to QuickBooks when you're ready.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <TrialButton />
          <WatchDemoButton />
        </div>
      </div>
    </section>
  );
}
