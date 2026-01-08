"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { signUpAction, SignUpFormState } from "@/app/(auth)/sign-up/actions";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: SignUpFormState = {
  message: "",
  success: false,
};

type PromoFormProps = {
  code?: string;
};

export function PromoForm({ code }: PromoFormProps) {
  const promoCode = code || "";

  const [state, formAction] = useActionState(signUpAction, initialState);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    businessName: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (state?.success && state?.redirectTo) {
      toast.success("Account Created", {
        description: "Welcome! Redirecting to onboarding...",
      });
      setTimeout(() => {
        window.location.href = state.redirectTo!;
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
          <div className="flex justify-center items-baseline">
            <span className="relative text-gray-200 text-xl font-normal font-['Inter'] leading-7">
              $299
              {/* Double strikethrough lines */}
              <span className="absolute left-0 top-1/2 w-full h-[2px] bg-red-500 -rotate-12 -translate-y-1/2" />
              <span className="absolute left-0 top-1/2 w-full h-[2px] bg-red-500 rotate-12 -translate-y-1/2" />
            </span>
            <span className="text-gray-200 text-xl font-normal font-['Inter'] leading-7">
              /month
            </span>
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
          {/* Hidden promo code field */}
          <input type="hidden" name="promoCode" value={promoCode} />

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
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
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
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            variant="promo"
            errors={state.errors?.password}
            label="Password"
            showLabel={true}
            showHint={true}
            required={true}
          />

          {/* Form Error */}
          {state.errors?._form && (
            <div className="self-stretch p-3 bg-red-900/20 rounded border border-red-800">
              <p className="text-sm text-red-400 text-center">{state.errors._form[0]}</p>
            </div>
          )}

          {/* Submit Button */}
          <SubmitButton label="Start free trial" pendingLabel="Creating Account..." variant="promo" />

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
            Terms
          </Link>
          {" "}and{" "}
          <Link
            href="/privacy-policy"
            className="text-[#E3B02F] hover:underline"
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
