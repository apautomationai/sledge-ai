"use client";

import React, { useEffect, useActionState } from "react";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { resetPasswordAction, ResetPasswordFormState } from "@/app/(auth)/reset-password/actions";

const initialState: ResetPasswordFormState = {
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
          Resetting...
        </div>
      ) : (
        "Reset Password"
      )}
    </Button>
  );
}

export default function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  useEffect(() => {
    if (!token) {
      toast.error("Invalid token");
      redirect("/sign-in");
    }
    if (state.message) {
      if (state.success) {
        toast.success("Password Reset", { description: state.message });
      } else {
        toast.error("Reset Failed", { description: state.message });
      }
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase">
          Reset Password
        </h1>
        <p className="text-gray-300 text-sm text-balance">
          Enter your new password to reset your account.
        </p>
      </div>

      <form
        action={formAction}
        className="space-y-4"
        // include token & email as hidden inputs
      >
        <input type="hidden" name="token" value={token} />

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300 font-medium text-sm">
            New Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter new password"
            className="h-11 bg-gray-800 border-4 border-gray-600 text-white placeholder-gray-400 rounded-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 transition-all duration-300"
          />
          {state.errors?.password && (
            <p className="text-sm text-red-400 mt-1">{state.errors.password[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-300 font-medium text-sm">
            Confirm Password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            className="h-11 bg-gray-800 border-4 border-gray-600 text-white placeholder-gray-400 rounded-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 transition-all duration-300"
          />
          {state.errors?.confirmPassword && (
            <p className="text-sm text-red-400 mt-1">{state.errors.confirmPassword[0]}</p>
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
        </Button>
      </div>
    </div>
  );
}
