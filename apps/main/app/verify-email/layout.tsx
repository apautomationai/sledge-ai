import React from "react";

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
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

      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
