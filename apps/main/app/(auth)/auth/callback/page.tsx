"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { setCookie } from "cookies-next";

function AuthCallbackComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Authentication Failed", {
        description: decodeURIComponent(error),
      });
      router.push("/sign-in");
      return;
    }

    if (token && userId) {
      // Set cookies
      setCookie("token", token, {
        maxAge: 24 * 60 * 60, // 1 day
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      setCookie("userId", userId, {
        maxAge: 24 * 60 * 60, // 1 day
        path: "/",
        secure: process.env.NODE_ENV === "production",
      });

      toast.success("Login Successful", {
        description: "You have been successfully logged in!",
      });

      // Redirect to onboarding - subscription provider will handle payment/dashboard redirect
      router.push("/onboarding");
    } else {
      toast.error("Authentication Failed", {
        description: "Invalid response from server",
      });
      router.push("/sign-in");
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <Loader2 className="h-12 w-12 text-yellow-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-white uppercase">Completing authentication...</h2>
        <p className="text-sm text-gray-400 text-balance">
          Please wait while we sign you in.
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="h-12 w-12 bg-gray-700 rounded-none mb-4"></div>
            <div className="h-6 bg-gray-700 rounded-none w-64 mb-2"></div>
            <div className="h-4 bg-gray-700 rounded-none w-48"></div>
          </div>
        </div>
      }
    >
      <AuthCallbackComponent />
    </Suspense>
  );
}

