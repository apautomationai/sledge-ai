"use client";

import React, { useEffect, useActionState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@workspace/ui/components/label";
import { setCookie } from "cookies-next";
import { resetPasswordAction, ResetPasswordFormState } from "@/app/(auth)/reset-password/actions";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";

const initialState: ResetPasswordFormState = {
  message: "",
  success: false,
};

export default function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);
  const [formData, setFormData] = React.useState({
    password: "",
    confirmPassword: "",
  });
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token") || "";
  const router = useRouter();

  useEffect(() => {
    if (!resetToken) {
      toast.error("Invalid token");
      router.push("/sign-in");
      return;
    }

    // Handle successful password reset with auto-login
    if (state.success && state.data?.token) {
      // Set cookies for authentication
      setCookie("token", state.data.token, {
        maxAge: 24 * 60 * 60, // 1 day
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      if (state.data.user?.id) {
        setCookie("userId", String(state.data.user.id), {
          maxAge: 24 * 60 * 60, // 1 day
          path: "/",
          secure: process.env.NODE_ENV === "production",
        });
      }

      toast.success("Password Reset", {
        description: "Password reset successfully! Logging you in..."
      });

      // Redirect to dashboard after a short delay to show the success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
      return;
    } 
    else {
      toast.error("Reset Failed", { description: state.message });
    }

  }, [state, resetToken, router]);

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
        Reset Your Password
      </div>

      <div className="w-full flex flex-col gap-[22px]">
        {/* Reset Password Form */}
        <form action={formAction} className="self-stretch flex flex-col gap-[24px] items-center">
          <input type="hidden" name="resetToken" value={resetToken} />

          <div className="self-stretch flex flex-col gap-[24px]">
            <div className="self-stretch flex flex-col gap-1">
              <Label htmlFor="password" className="self-stretch text-white text-sm font-medium font-['Inter']">
                New Password
              </Label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                variant="signin"
                errors={state.errors?.password}
                placeholder=""
                showLabel={false}
                showHint={false}
                required={true}
              />
            </div>

            <div className="self-stretch flex flex-col gap-1">
              <Label htmlFor="confirmPassword" className="self-stretch text-white text-sm font-medium font-['Inter']">
                Confirm Password
              </Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                variant="signin"
                errors={state.errors?.confirmPassword}
                placeholder=""
                showLabel={false}
                showHint={false}
                required={true}
              />
            </div>
          </div>

          {state.errors?._form && (
            <div className="p-3 bg-red-900/20 relative overflow-hidden w-full" style={{ border: '1px solid #808080', borderRadius: '4px' }}>
              <p className="text-sm text-red-400 text-center relative z-10">{state.errors._form[0]}</p>
            </div>
          )}

          <SubmitButton label="RESET PASSWORD" pendingLabel="Resetting..." variant="default" />
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
