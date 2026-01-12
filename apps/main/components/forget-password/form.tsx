"use client";

import React, { useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  forgotPasswordAction,
  ForgotPasswordFormState,
} from "@/app/(auth)/forget-password/actions";

const initialState: ForgotPasswordFormState = {
  message: "",
  success: false,
};

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialState
  );

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success("Request Sent", { description: state.message });
      } else {
        toast.error("Request Failed", { description: state.message });
      }
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
      <div className="self-stretch text-center text-[#edeceb] text-[22px] font-bold font-['Inter'] leading-7">
        Forgot Your Password?
      </div>

      <div className="w-full flex flex-col gap-[22px]">
        <p className="text-center text-[#aeaeae] text-sm font-normal font-['Inter'] leading-5">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {/* Forgot Password Form */}
        <form action={formAction} className="self-stretch flex flex-col gap-[24px] items-center">
          <div className="self-stretch flex flex-col gap-[24px]">
            <div className="self-stretch flex flex-col gap-1">
              <Label htmlFor="email" className="self-stretch text-white text-sm font-medium font-['Inter']">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder=""
                className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-[#1b1b1b] rounded border border-[#808080] text-[#f6f6f6] focus:border-amber-400 focus:outline-none transition-colors"
                required
              />
              {state.errors?.email && (
                <p className="text-sm text-red-400 mt-1">{state.errors.email[0]}</p>
              )}
            </div>
          </div>

          {state.errors?._form && (
            <div className="p-3 bg-red-900/20 relative overflow-hidden w-full" style={{ border: '1px solid #808080', borderRadius: '4px' }}>
              <p className="text-sm text-red-400 text-center relative z-10">{state.errors._form[0]}</p>
            </div>
          )}

          <SubmitButton label="SEND RESET LINK" pendingLabel="Sending..." variant="default" />
        </form>

        <div className="inline-flex justify-center items-center gap-1 w-full font-['Inter'] font-bold text-base">
          <Link
            href="/sign-in"
            className="uppercase leading-6 hover:text-amber-400 transition-colors"
            style={{ color: '#e3b02f' }}
          >
            ← BACK TO SIGN IN
          </Link>
        </div>
      </div>
    </div>
  );
}
