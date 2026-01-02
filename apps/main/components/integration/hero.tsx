"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface IntegrationHeroProps {
  logo: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  logoLabel: string;
  title: string;
  description: string;
}

export function IntegrationHero({
  logo,
  logoLabel,
  title,
  description,
}: IntegrationHeroProps) {
  return (
    <section className="w-full overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:items-stretch md:gap-12 lg:gap-16 w-full max-w-[1400px] mx-auto gap-8">
        {/* Logo Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center bg-[#1B1A17] border border-[#333] rounded-2xl p-6 sm:p-8 gap-4 w-full sm:w-[280px] md:w-[318px] h-[250px] sm:h-[280px] md:h-[318px] mx-auto md:mx-0 shrink-0"
        >
          <div className="flex items-center justify-center">
            <Image
              src={logo.src}
              alt={logo.alt}
              width={logo.width ?? 120}
              height={logo.height ?? 40}
              className="object-contain"
            />
          </div>
          <span className="text-white text-sm font-normal">{logoLabel}</span>
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase font-['League_Spartan']"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white text-lg lg:text-2xl"
          >
            {description}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
