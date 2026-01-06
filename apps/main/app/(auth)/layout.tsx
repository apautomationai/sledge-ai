
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="flex min-h-screen md:h-screen md:max-h-[1080px] relative overflow-hidden">
      {/* Background image - same as landing page */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/gpt4.png')",
          zIndex: -2,
        }}
      />
      {/* Black overlay - same as landing page */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: 0.7,
          zIndex: -1,
        }}
      />

      {/* Left Side - Form Area */}
      <div
        className="relative flex w-full md:w-[34%] xl:w-[34%] h-full overflow-y-auto hide-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div className="flex flex-col relative z-10 w-full py-8 md:py-0">
          {/* Form Container - Centered with flex-grow */}
          <div className="flex-1 flex justify-center items-center px-12 md:px-4 lg:px-10 xl:px-12 2xl:px-32 py-0 md:py-16">
            <div className="w-full max-w-md md:max-w-none">
              {children}
            </div>
          </div>

          {/* Footer - Sticky to bottom */}
          <div className="w-full text-center py-4 md:py-6 px-6 mt-auto">
            <Link href="/terms" className="text-zinc-400 text-sm font-normal font-['Inter'] underline leading-5 hover:text-zinc-400 active:text-zinc-400 focus:text-zinc-400 focus:outline-none">
              Terms of Service
            </Link>
            <span className="text-zinc-400 text-sm font-normal font-['Inter'] leading-5"> | </span>
            <Link href="/privacy" className="text-zinc-400 text-sm font-normal font-['Inter'] underline leading-5 hover:text-zinc-400 active:text-zinc-400 focus:text-zinc-400 focus:outline-none">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="relative hidden md:block overflow-hidden flex-1 h-full">
        <img
          src={pathname === '/sign-up' ? "/images/sign-up-test-1 2.png" : "/images/login.png"}
          alt={pathname === '/sign-up' ? "Sign Up" : "Login"}
          className="h-full w-full object-fill"
        />
      </div>
    </div>
    </>
  );
}




