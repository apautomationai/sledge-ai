"use client";
import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  PulsingOrb,
  FloatingElements,
  ProfessionalIcons,
} from "./animated-icons";
import {
  ArrowRight,
  Play,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { checkSession } from "./action";
import Link from "next/link";
import { InvoiceCard } from "./InvoiceCard"; // New component for the right-hand card


// --- Hero Component ---

export function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const { isLoggedIn } = await checkSession();
      setIsLoggedIn(isLoggedIn);
    };
    verifySession();
  }, []);

  // Simplified the primary button styles to match the image's gold button better

  const primaryButton = (
    <Button
      asChild
      size="lg"
      className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:via-yellow-300 hover:to-amber-400 text-gray-900 px-8 py-4 text-lg font-bold rounded-lg shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-400/60 transition-all duration-300 group uppercase border-2 border-yellow-600 w-full sm:w-auto"
    >
      <Link href="/sign-up">
        START FREE TRIAL
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
      </Link>
    </Button>
  );

  const secondaryButton = (
    <Button
      asChild
      variant="outline"
      size="lg"
      className="px-8 py-4 text-lg font-medium rounded-lg text-white bg-transparent hover:bg-gray-800 border-2 border-gray-600 hover:border-gray-500 transition-all duration-300 group uppercase w-full sm:w-auto"
    >
      <Link href="#demo">
        <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
        WATCH PRODUCT DEMO
      </Link>
    </Button>
  );

  return (
    <section className="relative overflow-hidden pt-16 pb-32 sm:pt-24 sm:pb-40 bg-gray-900">
      <Image
        src="/images/line.png"
        height={5}
        width={1920}
        alt="My Photo"
        className="mt-10 rounded-xl relative z-20 w-full"
      />
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage: `url('/images/dark-diamond-plate.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-black/80 to-gray-800/90" />
        {/* Floating/Animated Elements */}
        <FloatingElements />
        <ProfessionalIcons />
        <div className="absolute top-20 left-10 opacity-30">
          <PulsingOrb color="#FDB022" size={80} />
        </div>
        <div className="absolute top-40 right-20 opacity-20">
          <PulsingOrb color="#F59E0B" size={120} />
        </div>
        <div className="absolute bottom-32 left-1/4 opacity-25">
          <PulsingOrb color="#FF6B35" size={60} />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-500 rounded-full mix-blend-screen filter blur-xl opacity-10 animate-blob" />
          <div className="absolute top-40 right-20 w-72 h-72 bg-orange-500 rounded-full mix-blend-screen filter blur-xl opacity-10 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-amber-500 rounded-full mix-blend-screen filter blur-xl opacity-10 animate-blob animation-delay-4000" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* NEW: Two-column layout for Hero content on large screens */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start pt-16 lg:pt-24 gap-12 lg:gap-20">

          {/* LEFT COLUMN: Text and Buttons */}
          <div className="lg:w-1/2 text-center lg:text-left mx-auto lg:mx-0 max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              // Text size, weight, and color match the image
              className="left-1/2 text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-[4rem] leading-none uppercase"
            >
              AI-Powered
              <span className="block mt-2 sm:inline bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                {" "}
                Accounts Pay{" "}
              </span>
              <span className="block sm:inline">
                for Builders
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              // Text size and color match the image
              className="mt-8 text-xl leading-8 text-gray-300 max-w-xl mx-auto lg:mx-0 font-medium"
            >
              Sledge automates invoices, releases, and approvals &mdash; built tough for contractors, subs, and crews that move fast.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              {isLoggedIn ? (
                // If logged in, show the Watch Demo button (styled as the secondary button)
                secondaryButton 
              ) : (
                <>
                  {/* Start Free Trial button (Primary/Gold) */}
                  {primaryButton} 
                  {/* Watch Product Demo button (Secondary/Outline) */}
                  {secondaryButton} 
                </>
              )}
            </motion.div>
            
            {/* Sledge Logo / Bottom Text */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-16 lg:mt-24"
            >
                <div className="flex items-center justify-center lg:justify-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="33" height="37" viewBox="0 0 33 37">
                      <image xlinkHref="data:image/png;base64,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" x="0" y="0" width="33" height="37"/>
                    </svg>
                    <span className="text-3xl font-extrabold text-white uppercase">SLEDGE</span>
                </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Invoice Card Mockup */}
          <div className="lg:w-1/2 pt-16 lg:pt-0 flex justify-center lg:justify-start">
            <InvoiceCard />
          </div>
        </div>
        <Image
          src="/images/line2.png"
          height={5}
          width={1920}
          alt="My Photo"
          className="mt-10 rounded-xl relative z-20 w-full"
        />
        <p className="mt-4 text-sm text-center font-semibold tracking-widest text-gray-400 uppercase">
            HEAVY-DUTY SOFTWARE FOR HARD WORK
        </p>
      </div>
      
      {/* Removed the original Product Preview at the bottom, as the card is now in the main content area */}

    </section>
  );
}