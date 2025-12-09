"use client";

import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { ComingSoon } from "@/components/landing/upcoming";
import { SocialProof } from "@/components/landing/social-proof";
import { Pricing } from "@/components/landing/pricing";
import { UseCases } from "@/components/landing/use-cases";
import { About } from "@/components/landing/about";
import { Founders } from "@/components/landing/founders";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { useState, useEffect } from "react";
import { cn } from "@workspace/ui/lib/utils";

export default function Home() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsCollapsed(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div
      className={cn(
          "grid min-h-screen w-full transition-[grid-template-columns] duration-300 ease-in-out",
          isMobile
            ? "grid-cols-1" 
            : isCollapsed
            ? "md:grid-cols-[72px_1fr]" 
            : "md:grid-cols-[50px_1fr]" 
        )}
    >
      <Header />
      <main className="flex flex-col gap-12">
        <Hero />
        <Features />
        <ComingSoon />
        <SocialProof />
        <Pricing />
        <UseCases />
        <FAQ />
        <About />
        <Founders />
      </main>
      <Footer />
    </div>
  );
}
