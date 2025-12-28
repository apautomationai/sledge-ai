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
import { TrialButton } from "./trial-button";
import { WatchDemoButton } from "./watch-demo-button";

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
    <section className="relative flex items-center justify-center min-h-screen pt-24 pb-16 md:pt-28 md:pb-40 bg-[url('/images/hero-visual.png')] bg-cover bg-center bg-no-repeat bg-gradient-to-br from-gray-900/80 via-black/80 to-gray-800/80">
      {/* Background Elements */}

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge
              variant="outline"
              className="mb-6 px-4 py-2 text-sm font-medium border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100/50 transition-all duration-300"
            >
              <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
              Trusted by 10,000+ businesses worldwide
            </Badge>
          </motion.div> */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 sm:mt-6 md:mt-20 text-lg leading-6 text-gray-300 max-w-3xl mx-auto font-normal px-2 sm:px-0"
          >
            CONSTRUCTION MANAGEMENT SOFTWARE
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-2 sm:mt-2 md:mt-2 text-6xl font-bold tracking-tight text-white uppercase leading-[64px]"
          >
            The Builder’s ai office.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 sm:mt-6 md:mt-2 text-2xl leading-[30px] text-gray-300 max-w-3xl mx-auto font-normal px-2 sm:px-0"
          >
            One intelligent platform that runs your back office so you can run
            the jobsite.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 sm:mt-8 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0"
          >
            <TrialButton />
            <WatchDemoButton />
          </motion.div>

          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>10,000+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Enterprise Security</span>
            </div>
          </motion.div> */}
        </div>
      </div>
    </section>
  );
}
