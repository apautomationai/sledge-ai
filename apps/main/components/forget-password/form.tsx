"use client";

import React, { useEffect, useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { AtSign, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  forgotPasswordAction,
  ForgotPasswordFormState,
} from "@/app/(auth)/forget-password/actions";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ForgotPasswordFormState = {
  message: "",
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button 
      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-bold py-3 px-4 rounded-none transition-all duration-300 shadow-lg shadow-yellow-500/50 hover:shadow-yellow-400/60 border-2 border-yellow-600 uppercase" 
      type="submit" 
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
          Sending...
        </div>
      ) : (
        "Send Reset Link"
      )}
    </Button>
  );
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    forgotPasswordAction,
    initialState,
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-none flex items-center justify-center shadow-[0_0_30px_rgba(253,176,34,0.5),inset_0_0_20px_rgba(0,0,0,0.5)] border-4 border-yellow-600/60 mx-auto mb-3 relative">
            <AtSign className="h-8 w-8 text-gray-900 relative z-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase">
          Forgot Password
        </h1>
        <p className="text-gray-300 text-sm text-balance">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300 font-medium text-sm">Email</Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-20" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10 h-11 bg-gray-800 border-4 border-gray-600 text-white placeholder-gray-400 rounded-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 transition-all duration-300"
            />
          </div>
          {state.errors?.email && (
            <p className="text-sm text-red-400 mt-1">{state.errors.email[0]}</p>
          )}
        </div>
        {state.errors?._form && (
          <div className="p-3 bg-red-900/20 border-4 border-red-800 rounded-none">
            <p className="text-sm text-red-400 text-center">{state.errors._form[0]}</p>
          </div>
        )}
        <SubmitButton />
      </form>

      <div className="text-center pt-4 border-t-2 border-gray-600">
        <Button variant="link" asChild className="text-yellow-400 hover:text-yellow-300">
          <Link href="/sign-in">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
