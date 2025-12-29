"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Cards() {
  const cards = [
    {
      icon: "/images/image 12.png",
      title: "Money",
      subtile: "Automate invoices, payables, & approvals ",
    },
    {
      icon: "/images/person2.png",
      title: "People",
      subtile: "Ai handles reminders and scheduling",
    },
    {
      icon: "/images/image 13.png",
      title: "Docs",
      subtile: "Instantly scan, sort and search every file",
    },
    {
      icon: "/images/image 11.png",
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
        ease: "easeOut" as any,
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
        ease: "easeInOut" as any,
      },
    },
  };

  const glowVariants = {
    normal: { opacity: 0 },
    hover: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as any,
      },
    },
  };

  const titleVariants = {
    normal: { y: 0 },
    hover: {
      y: -40,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as any,
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
        ease: "easeInOut" as any,
      },
    },
  };

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" as any }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[48px] font-bold text-white mb-4 leading-tight sm:leading-tight md:leading-snug">
            YOUR ENTIRE OPERATION, SUPERCHARGED.
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-2xl leading-relaxed">
            Sledge is built as a unified AI platform that supports every part of the construction back office.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-[48px] px-4 lg:px-12 xl:px-0"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className="relative w-full aspect-[318/346] max-w-[318px] mx-auto group cursor-pointer overflow-hidden rounded-2xl"
              variants={cardVariants}
              animate="normal"
              whileHover="hover"
              whileTap="hover"
            >
              <Image
                src="/images/bg-steelplate.png"
                alt={card.title}
                fill
                className="object-fill rounded-2xl"
              />

              {/* Content Container */}
              <motion.div className="absolute inset-0 flex flex-col items-center justify-center pt-[20px] rounded-2xl">
                {/* Hover Glow Overlay */}
                <motion.div
                  className="absolute inset-0 left-[7px] pointer-events-none"
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
                  className="h-[184px] w-[184px] flex items-center justify-center mb-0"
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
                  className="text-lg sm:text-xl md:text-[24px] font-inter font-bold text-[#E3B02F]"
                  variants={titleVariants}
                >
                  {card.title}
                </motion.h3>

                {/* Subtitle */}
                <motion.p
                  className="text-base sm:text-lg md:text-[20px] font-inter font-normal text-[#E3B02F] text-center px-4 mt-0 max-w-xs"
                  variants={subtitleVariants}
                >
                  {card.subtile}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
