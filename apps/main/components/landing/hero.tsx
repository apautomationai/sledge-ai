"use client";
import { useState, useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  AnimatedRocket,
  AnimatedChart,
  PulsingOrb,
  FloatingElements,
  // GeometricPattern,
  ProfessionalIcons,
} from "./animated-icons";
import {
  ArrowRight,
  Play,
  // Star,
  // Users,
  // TrendingUp,
  // Shield,
} from "lucide-react";
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
    <section className="relative flex items-center justify-center min-h-[412px] md:min-h-screen py-12 md:py-16 overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/sledge-hero-video.mp4" type="video/mp4" />
      </video>

      {/* Video Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Background Elements */}

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-md lg:text-lg  text-gray-300 "
          >
            CONSTRUCTION MANAGEMENT SOFTWARE
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-2 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase  font-['League_Spartan']"
          >
            The Builder's ai office.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-2  md:mt-2 text-lg lg:text-2xl  text-white "
          >
            One intelligent platform that runs your back office so you can run
            the jobsite.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-2 md:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link href="/sign-up" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-[#E3B02F] rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors duration-300">
                <div className="text-center text-stone-800 text-base font-bold font-['Inter'] uppercase leading-6">
                  start a free trial
                </div>
              </div>
            </Link>
            <Link href="#demo" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-zinc-800 rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-zinc-700 transition-colors duration-300">
                <div className="text-center text-zinc-100 text-base font-bold font-['Inter'] uppercase leading-6">
                  WATCH HOW IT WORKS
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
