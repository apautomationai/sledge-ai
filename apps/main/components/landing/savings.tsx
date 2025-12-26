"use client";

import Image from "next/image";

export default function Savings() {
  // Fixed display values
  const annualSavings = 125000;
  const hoursPerYear = 500;

  return (
    <section className=" text-white py-20 ">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="justify-start text-white text-5xl font-bold font-['League_Spartan'] uppercase mb-4">
            Save Hours Every Week with AI Accounts Payable.
          </div>
          <div className="self-stretch text-center justify-start text-white text-2xl font-normal font-['Inter']">
            This calculator estimates how much time and money your team can save
            by automating invoice processing with AI. <br />
            Results are based on common construction back-office workflows.
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            {/* Invoices per month */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Invoices per month
              </label>
              <input
                type="number"
                value={500}
                readOnly
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* Time spent per invoice */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Time spent per invoice
              </label>
              <input
                type="text"
                value="5 minutes"
                readOnly
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* Number of workers */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Number of workers
              </label>
              <input
                type="number"
                value={3}
                readOnly
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>

            {/* Average hourly rate per worker */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Average hourly rate per worker
              </label>
              <input
                type="number"
                value={50}
                readOnly
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-3 text-white focus:outline-none focus:border-gray-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-8">
            <p className="text-sm text-gray-400 text-center mb-8">
              Estimated impact after automating payables with AI.
            </p>

            <div className="space-y-8">
              {/* Annual Savings */}
              <div className="text-center">
                <div className="justify-start text-white text-2xl font-medium font-['Inter']">Annual Savings</div>
                <div className="flex items-center justify-center gap-3">
                  <Image
                    src="/images/Vector.png"
                    alt="Savings icon"
                    width={48}
                    height={48}
                  />
                  <span
                    className="text-5xl font-bold"
                    style={{ color: "#FFAB3C" }}
                  >
                    ${annualSavings.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Annual Time Saved */}
              <div className="text-center">
                <div className="justify-start text-white text-2xl font-medium font-['Inter']">Annual Time Saved</div>
                <div className="flex items-center justify-center gap-3">
                  <Image
                    src="/images/Vector (1).png"
                    alt="Time saved icon"
                    width={48}
                    height={48}
                  />
                  <span
                    className="text-5xl font-bold"
                    style={{ color: "#FFAB3C" }}
                  >
                    {hoursPerYear.toLocaleString()} HOURS
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-8">
              Estimates vary by workflow and volume. Actual savings depend on
              usage and approval patterns.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 space-y-3">
              <button className="w-full text-white font-semibold py-3 px-6 rounded transition-colors flex items-center justify-center gap-2" style={{ backgroundColor: '#E3B02F' }}>
                SEE HOW SLEDGE AUTOMATES IT
              </button>
              <button className="w-full bg-transparent border border-gray-700 hover:border-gray-500 text-white font-semibold py-3 px-6 rounded transition-colors">
                START A FREE TRIAL
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
