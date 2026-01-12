"use client";

import React, { useEffect, useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="self-stretch h-11 px-4 py-2 inline-flex justify-center items-center gap-3 relative overflow-hidden hover:opacity-90 font-bold font-['Inter'] text-base leading-6 uppercase cursor-pointer transition-opacity"
      style={{ background: '#E3B02F', borderRadius: '4px', color: '#09090B' }}
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
          SENDING...
        </div>
      ) : (
        "SEND RESET LINK"
      )}
    </Button>
  );
}

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
    <div className="w-full flex flex-col justify-center items-center gap-5">
      {/* Logo - Centered */}
      <Link href="/" className="w-48 h-16 relative cursor-pointer">
        <img
          src="/images/logos/logo-sledge-symbol-custom.svg"
          alt="Logo"
          className="w-16 h-16 absolute left-0 top-0 rounded-2xl"
        />
        <div className="absolute left-[74.67px] top-[17.33px] justify-center text-white text-3xl font-bold font-['League_Spartan'] capitalize leading-8">
          SLEDGE
        </div>
      </Link>

      {/* Header */}
      <div className="self-stretch text-center text-gray-200 text-xl font-bold font-['Inter'] leading-7">
        Forgot your password?
      </div>

      <div className="w-full flex flex-col gap-5">
        {/* Description */}
        <div className="self-stretch text-center text-zinc-400 text-sm font-normal font-['Inter'] leading-5">
          Enter your email and we'll send you a link to reset your password.
        </div>

        {/* Form */}
        <form action={formAction} className="self-stretch flex flex-col gap-6">
          <div className="self-stretch flex flex-col gap-1">
            <Label htmlFor="email" className="self-stretch text-white text-sm font-medium font-['Inter']">
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder=""
                className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-zinc-900 rounded border border-neutral-500 text-stone-50 focus:border-amber-400 focus:outline-none transition-colors"
                required
              />
            </div>
            {state.errors?.email && (
              <p className="text-sm text-red-400 mt-1">{state.errors.email[0]}</p>
            )}
          </div>

          {state.errors?._form && (
            <div className="p-3 bg-red-900/20 relative overflow-hidden" style={{ border: '1px solid #808080', borderRadius: '4px' }}>
              <p className="text-sm text-red-400 text-center relative z-10">{state.errors._form[0]}</p>
            </div>
          )}

          <SubmitButton />
        </form>

        <div className="inline-flex justify-center items-center gap-1 w-full flex-wrap">
          <div className="text-white text-sm sm:text-base font-bold font-['Inter'] leading-6 whitespace-nowrap">
            REMEMBER YOUR PASSWORD?
          </div>
          <Link
            href="/sign-in"
            className="text-sm sm:text-base font-bold font-['Inter'] uppercase leading-6 hover:text-amber-400 whitespace-nowrap"
            style={{ color: '#E3B02F' }}
          >
            SIGN IN
          </Link>
        </div>
      </div>
    </div>
  );
}
