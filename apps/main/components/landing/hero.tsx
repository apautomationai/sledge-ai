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
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-28 md:pb-40 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/10 via-transparent to-orange-900/10 opacity-60" />
        
        {/* Diamond plate texture overlay - ROUGHER */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #FDB022 0, #FDB022 2px, transparent 0, transparent 40px),
                           repeating-linear-gradient(-45deg, #FDB022 0, #FDB022 2px, transparent 0, transparent 40px)`,
          backgroundSize: '40px 40px'
        }} />
        
        {/* Additional rough texture layer */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, transparent 20%, rgba(253, 176, 34, 0.1) 21%, rgba(253, 176, 34, 0.1) 22%, transparent 23%),
                           radial-gradient(circle at 80% 80%, transparent 20%, rgba(245, 158, 11, 0.1) 21%, rgba(245, 158, 11, 0.1) 22%, transparent 23%)`,
          backgroundSize: '200px 200px, 150px 150px'
        }} />

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

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl font-bold tracking-tight text-white xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase"
          >
            AI-Powered
            <span className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              {" "}
              Accounts Payable{" "}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 sm:mt-6 md:mt-8 text-base sm:text-lg md:text-xl leading-7 sm:leading-8 text-gray-300 max-w-3xl mx-auto font-medium px-2 sm:px-0"
          >
            Sledge automates invoices, releases, and approvals built tough for contractors, subs, and crews that move fast.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0"
          >
            {isLoggedIn ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-medium rounded-lg text-gray-900 bg-white hover:bg-gray-100 border-2 border-yellow-500 hover:border-yellow-400 transition-all duration-300 group shadow-lg shadow-yellow-500/20"
              >
                <Link href="#demo">
                  <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                  WATCH PRODUCT DEMO
                </Link>
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-500 hover:from-yellow-400 hover:via-yellow-300 hover:to-amber-400 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-bold rounded-lg shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-400/60 transition-all duration-300 group uppercase border-2 border-yellow-600"
                >
                  <Link href="/sign-up">
                    START FREE TRIAL
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base md:text-lg font-medium rounded-lg text-white bg-transparent hover:bg-gray-800 border-2 border-gray-600 hover:border-gray-500 transition-all duration-300 group uppercase"
                >
                  <Link href="#demo">
                    <Play className="mr-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                    WATCH PRODUCT DEMO
                  </Link>
                </Button>
              </>
            )}
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
