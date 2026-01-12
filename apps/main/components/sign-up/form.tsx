"use client";

import React, { useEffect, useActionState, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { signUpAction, SignUpFormState } from "@/app/(auth)/sign-up/actions";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: SignUpFormState = {
  message: "",
  success: false,
};

const GoogleIcon = () => (
  <img src="/images/Type=Google.svg" alt="Google" className="w-5 h-5" />
);

const MicrosoftIcon = () => (
  <img src="/images/Type=Microsoft.svg" alt="Microsoft" className="w-5 h-5" />
);

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleGoogleSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/v1/auth/google`;
  };

  const handleMicrosoftSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/v1/auth/microsoft`;
  };

  useEffect(() => {
    // Handle success - redirect to verify email page
    if (state?.success && state?.redirectTo) {
      toast.success("Account Created", {
        description: "Please check your email to verify your account.",
      });
      // Redirect to the verify-email page
      setTimeout(() => {
        window.location.href = state.redirectTo!;
      }, 1000);
      return;
    }

    // Show error messages
    if (state?.message && !state?.success) {
      toast.error("Sign Up Failed", {
        description: state.message,
      });
    }
  }, [state]);

  return (
    <div className="w-full flex flex-col justify-center items-center gap-[22px]">
      {/* Logo - Centered */}
      <Link href="/" className="w-[185.333px] h-16 relative cursor-pointer">
        <img
          src="/images/logos/logo-sledge-symbol-custom.svg"
          alt="Logo"
          className="w-16 h-16 absolute left-0 top-0 rounded-2xl"
        />
        <div className="absolute left-[74.67px] top-[17.33px] justify-center text-white text-[32px] font-bold font-['League_Spartan'] capitalize leading-8">
          SLEDGE
        </div>
      </Link>

      {/* Header */}
      <div className="self-stretch text-center justify-start text-[#edeceb] text-[22px] font-bold font-['Inter'] leading-7">
        Create a Sledge Account
      </div>

      <div className="w-full flex flex-col gap-[22px]">
        {/* Social Login Buttons */}
        <div className="self-stretch flex flex-col gap-3">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="self-stretch h-11 px-4 py-2 inline-flex justify-center items-center gap-3 relative overflow-hidden hover:text-gray-200 font-medium font-['Inter'] text-base leading-6 cursor-pointer"
            style={{ background: '#1b1b1b', border: '1px solid #808080', borderRadius: '4px', color: '#edeceb' }}
          >
            <GoogleIcon />
            <span className="justify-start">Sign Up with Google</span>
          </Button>
          <Button
            type="button"
            onClick={handleMicrosoftSignIn}
            className="self-stretch h-11 px-4 py-2 inline-flex justify-center items-center gap-3 relative overflow-hidden hover:text-gray-200 font-medium font-['Inter'] text-base leading-6 cursor-pointer"
            style={{ background: '#1b1b1b', border: '1px solid #808080', borderRadius: '4px', color: '#edeceb' }}
          >
            <MicrosoftIcon />
            <span className="justify-start">Sign Up with Microsoft</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="self-stretch inline-flex justify-start items-center gap-1.5">
          <div className="flex-1 h-px bg-[#505050]" />
          <div className="text-center justify-start text-[#aeaeae] text-sm font-normal font-['Inter'] leading-5">
            OR
          </div>
          <div className="flex-1 h-px bg-[#505050]" />
        </div>

        {/* Sign Up Form */}
        <form action={formAction} className="self-stretch flex flex-col justify-start items-center gap-6">
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <Label htmlFor="firstName" className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
                  First name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder=""
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-[#1b1b1b] rounded border border-[#808080] text-[#f6f6f6] focus:border-amber-400 focus:outline-none transition-colors"
                />
                {state.errors?.firstName && (
                  <p className="text-sm text-red-400 mt-1">{state.errors.firstName[0]}</p>
                )}
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <Label htmlFor="lastName" className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder=""
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-[#1b1b1b] rounded border border-[#808080] text-[#f6f6f6] focus:border-amber-400 focus:outline-none transition-colors"
                />
                {state.errors?.lastName && (
                  <p className="text-sm text-red-400 mt-1">{state.errors.lastName[0]}</p>
                )}
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <Label htmlFor="businessName" className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
                Business name
              </Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder=""
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-[#1b1b1b] rounded border border-[#808080] text-[#f6f6f6] focus:border-amber-400 focus:outline-none transition-colors"
              />
              {state.errors?.businessName && (
                <p className="text-sm text-red-400 mt-1">{state.errors.businessName[0]}</p>
              )}
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <Label htmlFor="email" className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder=""
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-[#1b1b1b] rounded border border-[#808080] text-[#f6f6f6] focus:border-amber-400 focus:outline-none transition-colors"
              />
              {state.errors?.email && (
                <p className="text-sm text-red-400 mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <Label htmlFor="phone" className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
                Phone number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder=""
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-[#1b1b1b] rounded border border-[#808080] text-[#f6f6f6] focus:border-amber-400 focus:outline-none transition-colors"
              />
              {state.errors?.phone && (
                <p className="text-sm text-red-400 mt-1">{state.errors.phone[0]}</p>
              )}
            </div>

            <div className="self-stretch flex flex-col justify-start items-end gap-1">
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <Label htmlFor="password" className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
                  Password
                </Label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  variant="default"
                  errors={state.errors?.password}
                  placeholder=""
                  showLabel={false}
                  showHint={false}
                  required={true}
                />
              </div>
              <p className="text-[#aeaeae] text-xs leading-4 w-full">At least 6 characters</p>
            </div>
          </div>

          {state.errors?._form && (
            <div className="p-3 bg-red-900/20 relative overflow-hidden" style={{ border: '1px solid #808080', borderRadius: '4px' }}>
              <p className="text-sm text-red-400 text-center relative z-10">{state.errors._form[0]}</p>
            </div>
          )}

          <div className="self-stretch inline-flex justify-end items-center gap-4">
            <SubmitButton label="SIGN UP" pendingLabel="Creating Account..." variant="default" />
          </div>

          <div className="inline-flex justify-center items-center gap-1 flex-wrap">
            <div className="justify-center text-white text-base font-bold font-['Inter'] leading-6 whitespace-nowrap">
              ALREADY HAVE AN ACCOUNT?
            </div>
            <Link
              href="/sign-in"
              className="justify-start text-base font-bold font-['Inter'] uppercase leading-6 hover:text-amber-400 whitespace-nowrap"
              style={{ color: '#E3B02F' }}
            >
              LOG IN
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
