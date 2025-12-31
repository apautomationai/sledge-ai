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
    <section className="w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center lg:gap-12 w-full max-w-8xl mx-auto px-6 md:px-8 lg:px-12 xl:px-32 pt-12 md:pt-16 gap-8">
        {/* Left Section */}
        <div className="flex-1 min-w-0 flex flex-col justify-start items-start gap-2 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white text-sm sm:text-base font-normal uppercase"
          >
            {subtitle}
          </motion.div>

          <div className="flex flex-col justify-start items-start gap-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white text-4xl sm:text-5xl md:text-4xl lg:text-3xl xl:text-5xl 2xl:text-6xl font-bold uppercase leading-tight md:leading-11 lg:leading-9 xl:leading-[52px] 2xl:leading-[60px]"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white text-lg sm:text-xl md:text-lg lg:text-base xl:text-xl 2xl:text-2xl font-normal"
            >
              {description}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full"
          >
            <Link href="/sign-up" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-[#e3b02f] rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors duration-300">
                <div className="text-center text-stone-800 text-sm sm:text-base md:text-sm lg:text-xs xl:text-base font-bold font-['Inter'] uppercase leading-6 whitespace-nowrap">
                  start a free trial
                </div>
              </div>
            </Link>

            <Link href="#demo" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-zinc-800 rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-zinc-700 transition-colors duration-300">
                <div className="text-center text-zinc-100 text-sm sm:text-base md:text-sm lg:text-xs xl:text-base font-bold font-['Inter'] uppercase leading-6 whitespace-nowrap">
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
