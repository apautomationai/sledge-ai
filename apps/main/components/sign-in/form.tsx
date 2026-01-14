"use client";

import React, { useEffect, Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import axios from "axios";
import { SignInSchema } from "@/lib/validators";
import { setCookie } from "cookies-next";
import { clearQueryCache } from "@/lib/query-client";
import { PasswordInput } from "@/components/auth/password-input";
import { SubmitButton } from "@/components/auth/submit-button";

interface SignInFormState {
  message: string;
  errors?: {
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  success: boolean;
  requiresTwoFactor?: boolean;
}

const GoogleIcon = () => (
  <Image
    src="/images/Type=Google.svg"
    alt="Google"
    className="w-5 h-5"
    width={20}
    height={20}
  />
);

const MicrosoftIcon = () => (
  <Image
    src="/images/Type=Microsoft.svg"
    alt="Microsoft"
    className="w-5 h-5"
    width={20}
    height={20}
  />
);

function SignInFormComponent() {
  const [state, setState] = useState<SignInFormState>({
    message: "",
    success: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("signup") === "success") {
      toast.success("Account created successfully!", {
        description: "You can now sign in with your new credentials.",
      });
    }
  }, [searchParams]);

  const handleGoogleSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/v1/auth/google`;
  };

  const handleMicrosoftSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/v1/auth/microsoft`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const email = formData.email;
    const password = formData.password;

    // Validate with Zod
    const validatedFields = SignInSchema.safeParse({ email, password });

    if (!validatedFields.success) {
      setState({
        message: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors,
        success: false,
      });
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.post(
        `${apiUrl}/api/v1/users/login`,
        { email, password },
        {
          withCredentials: true, // Important: enables cookie handling
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        },
      );

      // Check if response is successful and contains token
      if (response.data && response.data.token) {
        // Set local cookies for Next.js access
        setCookie("token", response.data.token, {
          maxAge: 24 * 60 * 60, // 1 day
          path: "/",
          // sameSite: "none",
          secure: process.env.NODE_ENV === "production",
        });

        if (response.data.user?.id) {
          setCookie("userId", String(response.data.user.id), {
            maxAge: 24 * 60 * 60, // 1 day
            path: "/",
            // sameSite: "none",
            secure: process.env.NODE_ENV === "production",
          });
        }

        toast.success("Login Successful", {
          description: "You have been successfully logged in!",
        });

        // Clear any cached data from previous sessions
        clearQueryCache();

        // Redirect to onboarding - subscription provider will handle payment/dashboard redirect
        router.push("/onboarding");
      } else {
        setState({
          message: "Invalid response from server",
          errors: { _form: ["Invalid response from server"] },
          success: false,
        });
      }
    } catch (error: any) {
      console.error("Sign in error:", error);

      if (error.response) {
        const data = error.response.data;

        // Handle various error scenarios from the API
        if (error.response.status === 403 && data.requiresTwoFactor) {
          setState({
            message: "Two-factor authentication required",
            requiresTwoFactor: true,
            success: false,
          });
        } else if (error.response.status === 423) {
          setState({
            message: data.message || "Account is locked.",
            errors: { _form: [data.message || "Account is locked"] },
            success: false,
          });
        } else {
          setState({
            message: data.message || "Invalid email or password",
            errors: {
              _form: [data.message || "Invalid email or password"],
              ...(data.errors || {}),
            },
            success: false,
          });
        }
      } else {
        setState({
          message: "Failed to connect to the server",
          errors: {
            _form: ["Failed to connect to the server. Please try again later."],
          },
          success: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show error message when state changes
  useEffect(() => {
    if (state?.message && !state?.success) {
      toast.error("Sign In Failed", {
        description: state.message,
      });
    }
  }, [state]);

  return (
    <div className="w-full flex flex-col justify-center items-center gap-[22px]">
      {/* Logo - Centered */}
      <Link href="/" className="w-[185.333px] h-16 relative cursor-pointer">
        <Image
          src="/images/logos/logo-sledge-symbol-custom.svg"
          alt="Logo"
          className="w-16 h-16 absolute left-0 top-0 rounded-2xl"
          width={64}
          height={64}
        />
        <div className="absolute left-[74.67px] top-[17.33px] justify-center text-white text-[32px] font-bold font-['League_Spartan'] capitalize leading-8">
          SLEDGE
        </div>
      </Link>

      {/* Header */}
      <div className="self-stretch text-center text-[#edeceb] text-[22px] font-bold font-['Inter'] leading-7">
        Log in to your account
      </div>

      <div className="w-full flex flex-col gap-[22px]">
        {/* Social Login Buttons */}
        <div className="self-stretch flex flex-col gap-[12px]">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="self-stretch h-11 px-4 py-2 inline-flex justify-center items-center gap-3 relative overflow-hidden hover:text-gray-200 font-medium font-['Inter'] text-base leading-6 cursor-pointer"
            style={{
              background: "#1b1b1b",
              border: "1px solid #808080",
              borderRadius: "4px",
              color: "#edeceb",
            }}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </Button>
          <Button
            type="button"
            onClick={handleMicrosoftSignIn}
            className="self-stretch h-11 px-4 py-2 inline-flex justify-center items-center gap-3 relative overflow-hidden hover:text-gray-200 font-medium font-['Inter'] text-base leading-6 cursor-pointer"
            style={{
              background: "#1b1b1b",
              border: "1px solid #808080",
              borderRadius: "4px",
              color: "#edeceb",
            }}
          >
            <MicrosoftIcon />
            <span>Continue with Microsoft</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="self-stretch inline-flex justify-start items-center gap-1.5">
          <div className="flex-1 h-px bg-[#505050]" />
          <div className="text-center text-[#aeaeae] text-sm font-normal font-['Inter'] leading-5">
            OR
          </div>
          <div className="flex-1 h-px bg-[#505050]" />
        </div>

        {/* Sign In Form */}
        <form
          onSubmit={handleSubmit}
          className="self-stretch flex flex-col gap-[24px] items-center"
        >
          <div className="self-stretch flex flex-col gap-[24px]">
            <div className="self-stretch flex flex-col gap-1">
              <Label
                htmlFor="email"
                className="self-stretch text-white text-sm font-medium font-['Inter']"
              >
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder=""
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-[#1b1b1b] rounded border border-[#808080] text-[#f6f6f6] focus:border-amber-400 focus:outline-none transition-colors"
                  required
                />
              </div>
              {state.errors?.email && (
                <p className="text-sm text-red-400 mt-1">
                  {state.errors.email[0]}
                </p>
              )}
            </div>

            <div className="self-stretch flex flex-col gap-1 items-end">
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                variant="signin"
                errors={state.errors?.password}
                placeholder=""
                label="Password"
                showLabel={true}
                showHint={false}
                required={true}
              />
              <Link
                href="/forget-password"
                className="self-stretch text-right text-[#aeaeae] text-xs font-normal font-['Inter'] underline leading-4"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {state.errors?._form && (
            <div
              className="p-3 bg-red-900/20 relative overflow-hidden w-full"
              style={{ border: "1px solid #808080", borderRadius: "4px" }}
            >
              <p className="text-sm text-red-400 text-center relative z-10">
                {state.errors._form[0]}
              </p>
            </div>
          )}

          <SubmitButton
            label="LOG IN"
            pendingLabel="Logging In..."
            variant="default"
            isLoading={isLoading}
          />
        </form>

        <div className="inline-flex justify-center items-center gap-1 w-full font-['Inter'] font-bold text-base">
          <div className="text-white leading-6">NEW TO SLEDGE?</div>
          <Link
            href="/sign-up"
            className="uppercase leading-6 hover:text-amber-400"
            style={{ color: "#e3b02f" }}
          >
            SIGN UP
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInForm() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-none mx-auto mb-4"></div>
            <div className="h-8 bg-gray-700 rounded-none mb-2 w-48"></div>
            <div className="h-4 bg-gray-700 rounded-none mb-6 w-64"></div>
          </div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-700 rounded-none"></div>
            <div className="h-10 bg-gray-700 rounded-none"></div>
            <div className="h-12 bg-gray-700 rounded-none"></div>
          </div>
        </div>
      }
    >
      <SignInFormComponent />
    </Suspense>
  );
}
