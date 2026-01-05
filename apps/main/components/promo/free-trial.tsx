"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const features = [
  "Unlimited AI invoice processing",
  "AI email listener + file ingestion",
  "Automatic invoices & vendor assignment",
  "Gmail & Outlook integration",
  "No per-invoice fees. No usage caps.",
];

export function FreeTrial() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic will be handled by the sign-up page
    window.location.href = "/sign-up";
  };

  return (
    <section className="w-full px-6 md:px-8 lg:px-12 pb-12 md:pb-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Features */}
          <div className="text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-['League_Spartan'] tracking-tight uppercase mb-4">
              Start your free trial in under a minute.
            </h2>
            <p className="text-base md:text-lg mb-6">
              Connect your inbox, let Sledge extract invoices, and push bills to
              QuickBooks automatically.
            </p>

            <div className="">
              <div className="p-2 bg-amber-400/10 rounded inline-flex justify-center items-center gap-2 mb-6">
                <p className="text-sm md:text-base font-semibold">
                  with Sledge Core you get:
                </p>
              </div>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#E3B02F] shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Sign Up Form */}
          <div className="relative w-full">
            <div className="w-full p-12 bg-zinc-900 rounded-lg shadow-[0px_0px_4px_1px_rgba(227,176,47,1.00)] outline outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col justify-start items-center gap-4">
              {/* Header */}
              <div className="flex flex-col justify-start items-center gap-1">
                <div className="justify-start text-amber-400 text-sm font-bold font-['Inter'] leading-5">
                  LIMITED-TIME OFFER
                </div>
                <div className="justify-start text-amber-400 text-5xl font-bold font-['League_Spartan'] uppercase leading-[52px]">
                  Get 2 Months Free
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col justify-start items-center gap-1">
                <div className="w-32 h-7 relative">
                  <div className="left-0 top-0 absolute justify-start text-gray-200 text-xl font-normal font-['Inter'] leading-7 line-through">
                    $299/month
                  </div>
                </div>
                <div className="justify-start">
                  <span className="text-amber-400 text-5xl font-bold font-['League_Spartan'] uppercase leading-[52px]">
                    $199
                  </span>
                  <span className="text-gray-200 text-2xl font-normal font-['Inter'] leading-10">
                    /month
                  </span>
                </div>
              </div>

              {/* Guarantee */}
              <div className="self-stretch pb-4 border-b border-zinc-800 inline-flex justify-center items-center gap-2">
                <div className="text-center justify-start text-white text-lg font-bold font-['Inter'] leading-6">
                  100% Money-Back Guarantee
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="self-stretch flex flex-col justify-start items-start gap-4">
                {/* First Name & Last Name */}
                <div className="self-stretch flex justify-start items-start gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-1 min-w-0">
                    <label
                      htmlFor="firstName"
                      className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      className="self-stretch h-11 p-4 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-lg font-normal font-['Inter'] leading-6 focus:outline-amber-400 transition-colors"
                      required
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-start items-start gap-1 min-w-0">
                    <label
                      htmlFor="lastName"
                      className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
                    >
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      className="self-stretch h-11 p-4 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-lg font-normal font-['Inter'] leading-6 focus:outline-amber-400 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Business Name */}
                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                  <label
                    htmlFor="businessName"
                    className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
                  >
                    Business name
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    className="self-stretch h-11 p-4 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-lg font-normal font-['Inter'] leading-6 focus:outline-amber-400 transition-colors"
                    required
                  />
                </div>

                {/* Email */}
                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                  <label
                    htmlFor="email"
                    className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="self-stretch h-11 p-4 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-lg font-normal font-['Inter'] leading-6 focus:outline-amber-400 transition-colors"
                    required
                  />
                </div>

                {/* Password */}
                <div className="self-stretch flex flex-col justify-center items-start gap-1">
                  <div className="self-stretch flex flex-col justify-start items-start gap-1">
                    <label
                      htmlFor="password"
                      className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="self-stretch h-11 p-4 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-lg font-normal font-['Inter'] leading-6 focus:outline-amber-400 transition-colors"
                      required
                    />
                  </div>
                  <div className="justify-start text-white text-sm font-normal font-['Inter'] leading-5">
                    At least 6 characters
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="self-stretch px-4 py-3 bg-amber-400 hover:bg-amber-500 rounded inline-flex justify-center items-center gap-2 overflow-hidden transition-colors duration-200"
                >
                  <div className="justify-start text-stone-800 text-base font-bold font-['Inter'] uppercase leading-5">
                    Start free trial
                  </div>
                </button>

                {/* Footer Text */}
                <div className="self-stretch inline-flex justify-center items-center gap-2">
                  <div className="text-center justify-start text-gray-200 text-sm font-normal font-['Inter'] leading-5">
                    You won't be charged until your trial ends. Cancel anytime
                  </div>
                </div>
              </form>
            </div>

            {/* Terms Link - Outside card */}
            <div className="text-center mt-4">
              <p className="text-gray-400 text-xs">
                By starting your trial, you agree to the{" "}
                <Link
                  href="/terms-conditions"
                  className="text-[#E3B02F] hover:underline"
                >
                  Terms and Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
