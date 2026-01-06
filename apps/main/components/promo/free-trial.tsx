"use client";

import { Check, Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { signUpAction, SignUpFormState } from "@/app/(auth)/sign-up/actions";

const initialState: SignUpFormState = {
  message: "",
  success: false,
};

const features = [
  "Unlimited AI invoice processing",
  "AI email listener + file ingestion",
  "Automatic invoices & vendor assignment",
  "Gmail & Outlook integration",
  "No per-invoice fees. No usage caps.",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-stretch px-4 py-3 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 rounded inline-flex justify-center items-center gap-2 overflow-hidden transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
    >
      {pending ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin h-5 w-5 text-stone-800" />
          <span className="text-stone-800 text-base font-bold font-['Inter'] uppercase leading-5">
            Creating Account...
          </span>
        </div>
      ) : (
        <div className="justify-start text-stone-800 text-base font-bold font-['Inter'] uppercase leading-5">
          Start free trial
        </div>
      )}
    </button>
  );
}

function PasswordInput({
  id,
  name,
  errors,
}: {
  id: string;
  name: string;
  errors?: string[];
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="self-stretch flex flex-col justify-center items-start gap-1">
      <div className="self-stretch flex flex-col justify-start items-start gap-1">
        <label
          htmlFor={id}
          className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
        >
          Password
        </label>
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            id={id}
            name={name}
            minLength={6}
            className="self-stretch w-full h-11 px-4 py-2 pr-10 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-sm font-medium focus:outline-amber-400 transition-colors"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors && <p className="text-sm text-red-400 mt-1">{errors[0]}</p>}
      </div>
      <div className="justify-start text-white text-sm font-normal font-['Inter'] leading-5">
        At least 6 characters
      </div>
    </div>
  );
}

export function FreeTrial() {
  const [state, formAction] = useActionState(signUpAction, initialState);

  useEffect(() => {
    if (state?.success && state?.redirectTo) {
      toast.success("Account Created", {
        description: "Welcome! Redirecting to onboarding...",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }

    if (state?.message && !state?.success) {
      toast.error("Sign Up Failed", {
        description: state.message,
      });
    }
  }, [state]);

  return (
    <section className="w-full px-6 md:px-8 lg:px-12 pb-12 pt-[24px] md:pb-16">
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
            <div className="w-full p-6 sm:p-12 bg-zinc-900 rounded-lg shadow-[0px_0px_4px_1px_rgba(227,176,47,1.00)] outline outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col justify-start items-center gap-4">
              {/* Header */}
              <div className="flex flex-col justify-start items-center gap-1">
                <div className="justify-start text-amber-400 text-sm font-bold font-['Inter'] leading-5">
                  LIMITED-TIME OFFER
                </div>
                <div className="justify-start text-amber-400 md:text-5xl text-3xl font-bold font-['League_Spartan'] uppercase">
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
                  <span className="text-amber-400 text-3xl md:text-5xl font-bold font-['League_Spartan'] uppercase leading-[52px]">
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
              <form action={formAction} className="self-stretch flex flex-col justify-start items-start gap-4">
                {/* First Name & Last Name */}
                <div className="self-stretch flex flex-col sm:flex-row justify-start items-start gap-4">
                  <div className="w-full sm:flex-1 flex flex-col justify-start items-start gap-1 min-w-0">
                    <label
                      htmlFor="firstName"
                      className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
                    >
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="self-stretch h-11 px-4 py-2 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-sm font-medium focus:outline-amber-400 transition-colors"
                      required
                    />
                    {state.errors?.firstName && (
                      <p className="text-sm text-red-400 mt-1">{state.errors.firstName[0]}</p>
                    )}
                  </div>
                  <div className="w-full sm:flex-1 flex flex-col justify-start items-start gap-1 min-w-0">
                    <label
                      htmlFor="lastName"
                      className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
                    >
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="self-stretch h-11 px-4 py-2 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-sm font-medium focus:outline-amber-400 transition-colors"
                      required
                    />
                    {state.errors?.lastName && (
                      <p className="text-sm text-red-400 mt-1">{state.errors.lastName[0]}</p>
                    )}
                  </div>
                </div>

                {/* Phone Number */}
                <div className="self-stretch flex flex-col justify-start items-start gap-1">
                  <label
                    htmlFor="phone"
                    className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
                  >
                    Phone number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+1234567890"
                    className="self-stretch h-11 px-4 py-2 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-sm font-medium focus:outline-amber-400 transition-colors"
                  />
                  {state.errors?.phone && (
                    <p className="text-sm text-red-400 mt-1">{state.errors.phone[0]}</p>
                  )}
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
                    name="businessName"
                    className="self-stretch h-11 px-4 py-2 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-sm font-medium focus:outline-amber-400 transition-colors"
                    required
                  />
                  {state.errors?.businessName && (
                    <p className="text-sm text-red-400 mt-1">{state.errors.businessName[0]}</p>
                  )}
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
                    name="email"
                    className="self-stretch h-11 px-4 py-2 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-sm font-medium focus:outline-amber-400 transition-colors"
                    required
                  />
                  {state.errors?.email && (
                    <p className="text-sm text-red-400 mt-1">{state.errors.email[0]}</p>
                  )}
                </div>

                {/* Password */}
                <PasswordInput
                  id="password"
                  name="password"
                  errors={state.errors?.password}
                />

                {/* Form Error */}
                {state.errors?._form && (
                  <div className="self-stretch p-3 bg-red-900/20 rounded border border-red-800">
                    <p className="text-sm text-red-400 text-center">{state.errors._form[0]}</p>
                  </div>
                )}

                {/* Submit Button */}
                <SubmitButton />

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
