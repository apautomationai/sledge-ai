"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Cards() {
  const cards = [
    {
      icon: "/images/image 11.svg",
      title: "Money",
      subtile: "Automate invoices, payables, & approvals ",
    },
    {
      icon: "/images/image 12.svg",
      title: "People",
      subtile: "Ai handles reminders and scheduling",
    },
    {
      icon: "/images/image 13.svg",
      title: "Docs",
      subtile: "Instantly scan, sort and search every file",
    },
    {
      icon: "/images/image 14.svg",
      title: "Projects",
      subtile: "Automate invoices, payables, & approvals ",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const,
      },
    },
    normal: { opacity: 1, y: 0 },
    hover: { opacity: 1, y: 0 },
  };

  const iconVariants = {
    normal: { scale: 1, z: 0, opacity: 1, y: 0 },
    hover: {
      scale: 0.75,
      z: -20,
      opacity: 0.6,
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
  };

  const glowVariants = {
    normal: { opacity: 0 },
    hover: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
  };

  const titleVariants = {
    normal: { y: 0 },
    hover: {
      y: -40,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
  };

  const subtitleVariants = {
    normal: { y: 40, opacity: 0 },
    hover: {
      y: -36,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan']">
            YOUR ENTIRE OPERATION, SUPERCHARGED.
          </h2>
          <p className="mt-2 text-lg md:text-2xl text-white">
            Sledge is built as a unified AI platform that supports every part of
            the construction back office.
          </p>
        </motion.div>

        {/* Wrapper to center the grid container */}
        <div className="flex justify-center">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full justify-items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {cards.map((card, index) => (
              <motion.div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-2xl"
                variants={cardVariants}
                animate="normal"
                whileHover="hover"
                whileTap="hover"
              >
                <Image
                  src="/images/bg-steelplate.png"
                  alt={card.title}
                  width={318}
                  height={346}
                  className="rounded-2xl"
                />

                {/* Content Container */}
                <motion.div className="absolute inset-0 flex flex-col items-center justify-center pt-[20px] rounded-2xl">
                  {/* Hover Glow Overlay */}
                  <motion.div
                    className="absolute inset-0 left-[7px] pointer-events-none z-10"
                    variants={glowVariants}
                  >
                    <Image
                      src="/images/hover-overlay-glow.png"
                      alt=""
                      fill
                      className="object-fill rounded-2xl"
                    />
                  </motion.div>
                  {/* Icon */}
                  <motion.div
                    className="h-[184px] w-[184px] flex items-center justify-center mb-0 z-20"
                    variants={iconVariants}
                  >
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={184}
                      height={184}
                      className="object-contain"
                    />
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    className="text-lg sm:text-xl md:text-[24px] font-inter font-bold text-[#E3B02F] z-20"
                    variants={titleVariants}
                  >
                    {card.title}
                  </motion.h3>

                  {/* Subtitle */}
                  <motion.p
                    className="text-base sm:text-lg md:text-[20px] font-inter font-normal text-[#E3B02F] text-center px-4 mt-0 max-w-xs z-20"
                    variants={subtitleVariants}
                  >
                    {card.subtile}
                  </motion.p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
