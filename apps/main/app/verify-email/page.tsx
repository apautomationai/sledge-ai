"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { toast } from "sonner";

export const dynamic = 'force-dynamic';

function VerifyEmailHeader() {
  return (
    <header className="w-full bg-[#141414] backdrop-blur-none shadow-[0_4px_20px_rgba(0,0,0,0.9),0_0_30px_rgba(253,176,34,0.2)] border-yellow-600/50">
      <nav className="w-full px-4 md:px-12" aria-label="Global">
        <div className="relative flex items-center justify-between py-3 md:py-[13px]">
          <Link href="/" className="flex items-center gap-3 z-10">
            <div className="w-full h-full rounded-xl flex items-center justify-center">
              <Image
                src={"/images/logos/logo-sledge-symbol-custom.svg"}
                alt="Logo"
                width={48}
                height={48}
              />
            </div>
            <span className="uppercase text-white text-2xl font-bold font-['League_Spartan'] leading-6">
              SLEDGE
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

// Helper function to decode JWT and extract email and verification status
function getTokenData(): { email: string | null; isVerified: boolean } {
  if (typeof document === "undefined") return { email: null, isVerified: false };

  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) => cookie.trim().startsWith("token="));

  if (!tokenCookie) return { email: null, isVerified: false };

  const token = tokenCookie.split("=")[1];
  if (!token) return { email: null, isVerified: false };

  try {
    // Decode JWT payload (second part of the token)
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return { email: null, isVerified: false };

    const payload = JSON.parse(atob(parts[1]));
    return {
      email: payload.email || null,
      isVerified: payload.is_verified || false,
    };
  } catch (error) {
    return { email: null, isVerified: false };
  }
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoadingEmail, setIsLoadingEmail] = useState(true);

  // Extract email from JWT token on component mount and check if already verified
  useEffect(() => {
    const { email, isVerified } = getTokenData();

    // Only check if already verified when there's NO verification token in URL
    // (if there's a token, let the verification process handle it)
    if (isVerified && !token) {
      window.location.href = "/onboarding";
      return;
    }

    if (email) {
      setUserEmail(email);
    } else {
      // If no email from token, try to get from URL query params
      const emailParam = searchParams.get("email");
      if (emailParam) {
        setUserEmail(emailParam);
      }
    }
    setIsLoadingEmail(false);
  }, [searchParams, token]);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (token && verificationStatus === "idle") {
      handleVerification(token);
    }
  }, [token, verificationStatus]);

  const handleVerification = async (verificationToken: string) => {
    setVerificationStatus("verifying");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/verify-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important: This allows cookies to be sent/received
          body: JSON.stringify({ token: verificationToken }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationStatus("success");
        toast.success("Email Verified!", {
          description: "Your email has been verified successfully. Redirecting...",
        });

        // Manually set cookies in case the API cookies didn't work (for same-site issues)
        if (typeof document !== "undefined") {
          // Set token cookie
          if (data.token) {
            document.cookie = `token=${data.token}; path=/; max-age=${24 * 60 * 60}`;
          }
          // Set userId cookie
          if (data.user?.id) {
            document.cookie = `userId=${data.user.id}; path=/; max-age=${24 * 60 * 60}`;
          }
        }

        // Redirect to onboarding immediately
        window.location.href = "/onboarding";
      } else {
        // Check if error is "Email already verified"
        if (data.message && data.message.includes("already verified")) {
          // User is already verified, just redirect them
          toast.success("Already Verified", {
            description: "Your email is already verified. Redirecting...",
          });
          window.location.href = "/onboarding";
        } else {
          setVerificationStatus("error");
          toast.error("Verification Failed", {
            description: data.message || "Invalid or expired verification link.",
          });
        }
      }
    } catch (error) {
      setVerificationStatus("error");
      toast.error("Verification Failed", {
        description: "Could not verify your email. Please try again.",
      });
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail) {
      toast.error("Unable to Resend", {
        description: "Could not determine your email address. Please sign in again.",
      });
      return;
    }

    setIsResending(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/resend-verification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Email Sent!", {
          description: "A new verification email has been sent. Please check your inbox.",
        });
      } else {
        toast.error("Failed to Send Email", {
          description: data.message || "Could not resend verification email. Please try again.",
        });
      }
    } catch (error) {
      toast.error("Failed to Send Email", {
        description: "Could not resend verification email. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  // If verification is in progress or successful, show that status
  if (verificationStatus === "verifying") {
    return (
      <>
        <VerifyEmailHeader />
        <div className="w-full flex flex-col justify-center min-h-screen px-6 md:px-8 lg:px-12 py-12 md:py-16">
          <div className="w-full max-w-[600px] mx-auto bg-[#1B1A17] border border-[#333] rounded-2xl p-8 md:p-10 lg:p-12 flex flex-col gap-8 relative z-10">
            <div className="text-center text-gray-200 text-xl sm:text-2xl md:text-3xl font-bold font-['Inter'] leading-tight">
              Verifying Your Email
            </div>

            <div className="w-full flex flex-col gap-8 py-6">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-amber-400/10 flex items-center justify-center">
                <svg className="animate-spin h-10 w-10 md:h-12 md:w-12 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <p className="text-center text-zinc-400 text-base md:text-lg font-normal font-['Inter'] leading-6">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (verificationStatus === "success") {
    return (
      <>
        <VerifyEmailHeader />
        <div className="w-full flex flex-col justify-center min-h-screen px-6 md:px-8 lg:px-12 py-12 md:py-16">
          <div className="w-full max-w-[600px] mx-auto bg-[#1B1A17] border border-[#333] rounded-2xl p-8 md:p-10 lg:p-12 flex flex-col gap-8 relative z-10">
            <div className="text-center text-gray-200 text-xl sm:text-2xl md:text-3xl font-bold font-['Inter'] leading-tight">
              Email Verified!
            </div>

            <div className="w-full flex flex-col gap-8 py-6">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <p className="text-center text-zinc-400 text-base md:text-lg font-normal font-['Inter'] leading-6">
                Your email has been successfully verified. Redirecting to your dashboard...
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (verificationStatus === "error") {
    return (
      <>
        <VerifyEmailHeader />
        <div className="w-full flex flex-col justify-center min-h-screen px-6 md:px-8 lg:px-12 py-12 md:py-16">
          <div className="w-full max-w-[600px] mx-auto bg-[#1B1A17] border border-[#333] rounded-2xl p-8 md:p-10 lg:p-12 flex flex-col gap-8 relative z-10">
            <div className="text-center text-gray-200 text-xl sm:text-2xl md:text-3xl font-bold font-['Inter'] leading-tight">
              Verification Failed
            </div>

            <div className="w-full flex flex-col gap-8 py-6">
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-10 h-10 md:w-12 md:h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <p className="text-center text-zinc-400 text-base md:text-lg font-normal font-['Inter'] leading-6">
                The verification link is invalid or has expired. Please request a new verification email below.
              </p>

              {!isLoadingEmail && userEmail && (
                <p className="text-center text-zinc-300 text-sm md:text-base font-normal font-['Inter'] leading-6">
                  Sending to: <span className="text-amber-400 font-medium">{userEmail}</span>
                </p>
              )}

              <div className="flex flex-col gap-4 w-full mt-4">
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending || !userEmail}
                  className="self-stretch h-12 md:h-14 px-6 py-3 inline-flex justify-center items-center gap-3 relative overflow-hidden hover:opacity-90 font-bold font-['Inter'] text-base md:text-lg leading-6 uppercase cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#E3B02F', borderRadius: '4px', color: '#09090B' }}
                >
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </Button>
                <Link href="/sign-up" className="w-full">
                  <Button
                    className="w-full h-12 md:h-14 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded flex justify-center items-center gap-2 overflow-hidden transition-colors font-bold font-['Inter'] text-base md:text-lg uppercase leading-tight cursor-pointer"
                    style={{ color: '#E5E5E5' }}
                  >
                    Back to Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Default state: Show "check your email" message (when no token in URL)
  return (
    <>
      <VerifyEmailHeader />
      <div className="w-full flex flex-col justify-center min-h-screen px-6 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="w-full max-w-[600px] mx-auto bg-[#1B1A17] border border-[#333] rounded-2xl p-8 md:p-10 lg:p-12 flex flex-col gap-8 relative z-10">
          <div className="text-center text-gray-200 text-xl sm:text-2xl md:text-3xl font-bold font-['Inter'] leading-tight">
            Verify Your Email to Continue
          </div>

          <div className="w-full flex flex-col gap-8 py-6">
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full bg-amber-400/10 flex items-center justify-center">
              <svg className="w-10 h-10 md:w-12 md:h-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-center text-white text-base md:text-lg font-normal font-['Inter'] leading-6">
                If an account exists for this email, we have sent a verification link.
              </p>
              <p className="text-center text-white text-base md:text-lg font-normal font-['Inter'] leading-6">
                Please check your inbox to verify your account.
              </p>
              {!isLoadingEmail && userEmail && (
                <p className="text-center text-zinc-300 text-sm md:text-base font-normal font-['Inter'] leading-6 mt-2">
                  Email sent to: <span className="text-amber-400 font-medium">{userEmail}</span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4 w-full mt-4">
              <Button
                onClick={handleResendVerification}
                disabled={isResending || !userEmail}
                className="w-full h-12 md:h-14 px-6 py-3 inline-flex justify-center items-center gap-3 relative overflow-hidden hover:opacity-90 font-bold font-['Inter'] text-base md:text-lg leading-6 uppercase cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#E3B02F', borderRadius: '4px', color: '#09090B' }}
              >
                {isResending ? "Sending..." : "Resend Verification Email"}
              </Button>
              <Link href="/sign-in" className="w-full">
                <Button
                  className="w-full h-12 md:h-14 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded flex justify-center items-center gap-2 overflow-hidden transition-colors font-bold font-['Inter'] text-base md:text-lg uppercase leading-tight cursor-pointer"
                  style={{ color: '#E5E5E5' }}
                >
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <>
        <VerifyEmailHeader />
        <div className="w-full flex flex-col justify-center min-h-screen px-6 md:px-8 lg:px-12 py-12 md:py-16">
          <div className="w-full max-w-[600px] mx-auto bg-[#1B1A17] border border-[#333] rounded-2xl p-8 md:p-10 lg:p-12 flex flex-col gap-8 relative z-10">
            <div className="text-center text-gray-200 text-xl sm:text-2xl md:text-3xl font-bold font-['Inter'] leading-tight">
              Loading...
            </div>
          </div>
        </div>
      </>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
