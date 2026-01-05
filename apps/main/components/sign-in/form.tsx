"use client";

import React, { useEffect, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { AtSign, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import axios from "axios";
import { SignInSchema } from "@/lib/validators";
import { setCookie } from "cookies-next";
import { clearQueryCache } from "@/lib/query-client";

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

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.566,44,31.2,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <path fill="#ff5722" d="M22 22H6V6h16v16z" />
    <path fill="#4caf50" d="M42 22H26V6h16v16z" />
    <path fill="#ffc107" d="M42 42H26V26h16v16z" />
    <path fill="#03a9f4" d="M22 42H6V26h16v16z" />
  </svg>
);

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button
      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-bold py-3 px-4 rounded-none transition-all duration-300 shadow-lg shadow-yellow-500/50 hover:shadow-yellow-400/60 border-2 border-yellow-600 uppercase"
      type="submit"
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
          Signing In...
        </div>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}

function SignInFormComponent() {
  const [state, setState] = useState<SignInFormState>({
    message: "",
    success: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/v1/auth/google`;
  };

  const handleMicrosoftSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/v1/auth/microsoft`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${apiUrl}/api/v1/users/login`,
        { email, password },
        {
          withCredentials: true, // Important: enables cookie handling
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
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
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-none flex items-center justify-center shadow-[0_0_30px_rgba(253,176,34,0.5),inset_0_0_20px_rgba(0,0,0,0.5)] border-4 border-yellow-600/60 mx-auto mb-3 relative">
            <Lock className="h-8 w-8 text-gray-900 relative z-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase">
          Welcome Back
        </h1>
        <p className="text-gray-300 text-sm text-balance">
          Sign in to your account to continue
        </p>
      </div>

      <div className="space-y-6">
        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            className="h-11 bg-gray-800 border-4 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-gray-200 rounded-none transition-all duration-300 relative overflow-hidden group uppercase"
          >
            <GoogleIcon className="mr-2 h-4 w-4 relative z-10" />
            <span className="relative z-10">Google</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleMicrosoftSignIn}
            className="h-11 bg-gray-800 border-4 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-gray-200 rounded-none transition-all duration-300 relative overflow-hidden group uppercase"
          >
            <MicrosoftIcon className="mr-2 h-4 w-4 relative z-10" />
            <span className="relative z-10">Microsoft</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-600" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-br from-gray-900 to-black px-3 text-sm text-gray-400">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <Label htmlFor="email" className="text-gray-300 font-medium text-sm">
              Email Address
            </Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-20" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10 h-11 bg-gray-800 border-4 border-gray-600 text-white placeholder-gray-400 rounded-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 transition-all duration-300 relative z-10"
                required
              />
            </div>
            {state.errors?.email && (
              <p className="text-sm text-red-400 mt-1">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-gray-300 font-medium text-sm">
                Password
              </Label>
              <Link
                href="/forget-password"
                className="text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-20" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10 h-11 bg-gray-800 border-4 border-gray-600 text-white placeholder-gray-400 rounded-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 transition-all duration-300 relative z-10"
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-300 z-20"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {state.errors?.password && (
              <p className="text-sm text-red-400 mt-1">{state.errors.password[0]}</p>
            )}
          </div>

          {state.errors?._form && (
            <div className="p-3 bg-red-900/20 border-4 border-red-800 rounded-none relative overflow-hidden">
              <p className="text-sm text-red-400 text-center relative z-10">{state.errors._form[0]}</p>
            </div>
          )}

          <SubmitButton isLoading={isLoading} />
        </form>

        <div className="text-sm text-gray-400 text-center pt-4 border-t-2 border-gray-600">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors duration-300 underline underline-offset-4"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInForm() {
  return (
    <Suspense fallback={
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
    }>
      <SignInFormComponent />
    </Suspense>
  );
}