"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface HeroProps {
  subtitle: string;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

export function Hero({ subtitle, title, description, image }: HeroProps) {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 pt-12 md:pt-16">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-12 w-full max-w-[1400px] mx-auto gap-8">
        {/* Left Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-2 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm md:text-md lg:text-lg text-gray-300"
          >
            {subtitle}
          </motion.p>

          <div className="flex flex-col justify-start items-start gap-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-2 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase font-['League_Spartan']"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-2 text-lg lg:text-2xl text-white"
            >
              {description}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-2 md:mt-6 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 w-full"
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

        {/* Right Section - Image */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full lg:w-auto lg:shrink-0"
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width ?? 663}
            height={image.height ?? 373}
            className="rounded-lg w-full h-auto lg:w-[380px] lg:h-[214px] xl:w-[550px] xl:h-[310px] 2xl:w-[663px] 2xl:h-[373px]"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
}
