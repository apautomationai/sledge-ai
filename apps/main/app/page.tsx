"use client";

import { Header } from "@/components/landing/new-header";
import { Hero } from "@/components/landing/new-hero";
import { Features } from "@/components/landing/features";
import { ComingSoon } from "@/components/landing/upcoming";
import { SocialProof } from "@/components/landing/social-proof";
import { Pricing } from "@/components/landing/pricing";
import { UseCases } from "@/components/landing/use-cases";
import { About } from "@/components/landing/about";
import { Founders } from "@/components/landing/founders";
import { FAQ } from "@/components/landing/faq";
import { useState, useEffect } from "react";
import { cn } from "@workspace/ui/lib/utils";
import WhatIsIt from "@/components/landing/what-is-it";
import IntegrationShowcase from "@/components/landing/integration-showcase";
import { Footer } from "@/components/landing/new-footer";
import SeeTheDifference from "@/components/landing/see-the-difference";
import Savings from "@/components/landing/savings";
import ImportantTask from "@/components/landing/important-task";
import ReadyToRun from "@/components/landing/ready-to-run";
import { Cards } from "@/components/landing/cards";
import { Testimonial } from "@/components/landing/testimonial";

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
    <div className="min-h-screen w-full">
      <Header />
      <main className="flex flex-col">
        <Hero />
        <WhatIsIt />

        {/* Sections with fixed background */}
        <div className="relative">
          {/* Fixed background image */}
          <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
            style={{
              backgroundImage: "url('/images/gpt4.png')",
              zIndex: -1,
            }}
          />
          {/* Black overlay with opacity */}
          <div
            className="fixed inset-0 bg-black pointer-events-none"
            style={{
              opacity: 0.7,
              zIndex: -1,
            }}
          />

          {/* Scrollable content with background */}
          <div className="relative">
            <IntegrationShowcase />
            <SeeTheDifference />
            <Cards />
            <Savings />
            <ImportantTask />
            <Testimonial />
            <ReadyToRun />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
