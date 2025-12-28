"use client";

import { Header } from "@/components/landing/new-header";
import { Hero } from "@/components/landing/new-hero";
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
