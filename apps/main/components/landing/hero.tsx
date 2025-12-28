"use client";
import { useState, useEffect } from "react";
import {
  AnimatedRocket,
  AnimatedChart,
  PulsingOrb,
  FloatingElements,
  ProfessionalIcons,
} from "./animated-icons";
import { motion } from "framer-motion";
import Image from "next/image";
import { checkSession } from "./action";
import Link from "next/link";

export function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      const { isLoggedIn } = await checkSession();
      setIsLoggedIn(isLoggedIn);
    };
    verifySession();
  }, []);
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-28 md:pb-40 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 via-transparent to-orange-900/10 opacity-60" />

        {/* Diamond plate texture overlay - ROUGHER */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #FDB022 0, #FDB022 2px, transparent 0, transparent 40px),
                           repeating-linear-gradient(-45deg, #FDB022 0, #FDB022 2px, transparent 0, transparent 40px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Additional rough texture layer */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, transparent 20%, rgba(253, 176, 34, 0.1) 21%, rgba(253, 176, 34, 0.1) 22%, transparent 23%),
                           radial-gradient(circle at 80% 80%, transparent 20%, rgba(245, 158, 11, 0.1) 21%, rgba(245, 158, 11, 0.1) 22%, transparent 23%)`,
            backgroundSize: "200px 200px, 150px 150px",
          }}
        />

        {/* Professional floating elements - hidden on mobile */}
        <div className="hidden md:block">
          <FloatingElements />
          <ProfessionalIcons />
        </div>

        {/* Animated Background Elements - scaled down or hidden on mobile */}
        <div className="absolute top-20 left-4 sm:left-10 opacity-20 sm:opacity-30">
          <PulsingOrb color="#FDB022" size={40} />
        </div>
        <div className="absolute top-40 right-4 sm:right-20 opacity-15 sm:opacity-20 hidden sm:block">
          <PulsingOrb color="#F59E0B" size={80} />
        </div>
        <div className="absolute bottom-32 left-1/4 opacity-20 sm:opacity-25 hidden sm:block">
          <PulsingOrb color="#FF6B35" size={40} />
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-10 sm:top-20 left-4 sm:left-20 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-yellow-500 rounded-full mix-blend-screen filter blur-xl opacity-10 animate-blob" />
          <div className="absolute top-20 sm:top-40 right-4 sm:right-20 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-orange-500 rounded-full mix-blend-screen filter blur-xl opacity-10 animate-blob animation-delay-2000" />
          <div className="absolute bottom-10 sm:bottom-20 left-1/4 sm:left-1/3 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-amber-500 rounded-full mix-blend-screen filter blur-xl opacity-10 animate-blob animation-delay-4000" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1014px] mx-auto inline-flex flex-col justify-start items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="self-stretch flex flex-col justify-start items-center gap-2"
          >
            <h1 className="text-center text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-league-spartan uppercase leading-tight lg:leading-[64px]">
              The Builder's AI Office.
            </h1>
            <p className="self-stretch text-center text-white text-lg sm:text-xl lg:text-2xl font-normal font-sans leading-7 lg:leading-8 px-4 sm:px-0">
              One intelligent platform that runs your back office so you can run the jobsite.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex flex-col sm:flex-row justify-start items-center gap-4"
          >
            {isLoggedIn ? (
              <Link
                href="#demo"
                className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded flex justify-start items-start gap-2 overflow-hidden transition-colors"
              >
                <span className="text-center text-zinc-100 text-base font-bold font-sans uppercase leading-6">
                  WATCH HOW IT WORKS
                </span>
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="px-4 py-3 bg-amber-400 hover:bg-amber-500 rounded flex justify-start items-start gap-2 overflow-hidden transition-colors"
                >
                  <span className="text-center text-stone-800 text-base font-bold font-sans uppercase leading-6">
                    START A FREE TRIAL
                  </span>
                </Link>
                <Link
                  href="#demo"
                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 rounded flex justify-start items-start gap-2 overflow-hidden transition-colors"
                >
                  <span className="text-center text-zinc-100 text-base font-bold font-sans uppercase leading-6">
                    WATCH HOW IT WORKS
                  </span>
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Product Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 sm:mt-16 md:mt-20 mx-auto max-w-6xl px-2 sm:px-0"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

            {/* Floating animated elements around the preview - hidden on mobile */}
            <div className="absolute -top-20 -left-8 z-20 hidden md:block">
              <AnimatedRocket />
            </div>
            <div className="absolute -bottom-5 -right-20 z-20 hidden md:block">
              <AnimatedChart />
            </div>

            <div className="relative rounded-none bg-gray-900/90 backdrop-blur-none border-4 sm:border-6 md:border-8 border-yellow-600/60 shadow-[0_0_30px_rgba(253,176,34,0.4),inset_0_0_20px_rgba(0,0,0,0.5)] p-2 sm:p-3 md:p-4">
              {/* Corner screws/rivets - hidden on mobile */}
              <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gray-800 rounded-full border-2 sm:border-3 md:border-4 border-gray-500 shadow-[inset_0_0_5px_rgba(0,0,0,0.8),0_2px_4px_rgba(0,0,0,0.9)] z-20 hidden sm:flex items-center justify-center">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gray-800 rounded-full border-2 sm:border-3 md:border-4 border-gray-500 shadow-[inset_0_0_5px_rgba(0,0,0,0.8),0_2px_4px_rgba(0,0,0,0.9)] z-20 hidden sm:flex items-center justify-center">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
              <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gray-800 rounded-full border-2 sm:border-3 md:border-4 border-gray-500 shadow-[inset_0_0_5px_rgba(0,0,0,0.8),0_2px_4px_rgba(0,0,0,0.9)] z-20 hidden sm:flex items-center justify-center">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
              <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gray-800 rounded-full border-2 sm:border-3 md:border-4 border-gray-500 shadow-[inset_0_0_5px_rgba(0,0,0,0.8),0_2px_4px_rgba(0,0,0,0.9)] z-20 hidden sm:flex items-center justify-center">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>

              {/* Weld marks / scratches */}
              <div className="absolute top-2 left-1/4 w-16 h-1 bg-yellow-600/30 blur-sm"></div>
              <div className="absolute bottom-2 right-1/4 w-12 h-1 bg-yellow-600/30 blur-sm"></div>

              <div className="aspect-video rounded-none bg-gradient-to-br from-gray-950 to-black flex items-center justify-center p-2 sm:p-4 md:p-8 border-2 sm:border-3 md:border-4 border-gray-600 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
                {/* Floating orbs inside the demo area - hidden on small mobile */}
                <div className="absolute top-4 left-4 hidden sm:block">
                  <PulsingOrb color="#FDB022" size={30} />
                </div>
                <div className="absolute bottom-4 right-4 hidden sm:block">
                  <PulsingOrb color="#F59E0B" size={25} />
                </div>
                <div className="relative rounded-lg shadow-2xl overflow-hidden border sm:border-2 border-yellow-600/20">
                  <Image
                    src="/images/dashboard.png"
                    alt="SLEDGE Product Screenshot"
                    width={1200}
                    height={900}
                    className="w-auto h-auto rounded-lg"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
