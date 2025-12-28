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
      icon: "/images/job2.png",
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
    normal: { scale: 1, z: 0, opacity: 1 },
    hover: {
      scale: 0.75,
      z: -20,
      opacity: 0.6,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as any,
      },
    },
  };

  const titleVariants = {
    normal: { y: 0 },
    hover: {
      y: -20,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as any,
      },
    },
  };

  const subtitleVariants = {
    normal: { y: 40, opacity: 0 },
    hover: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as any,
      },
    },
  };

  const overlayVariants = {
    visible: { opacity: 0 },
    hover: {
      opacity: 0.3,
      transition: {
        duration: 0.3,
        ease: "easeInOut" as any,
      },
    },
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" as any }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            YOUR ENTIRE OPERATION, SUPERCHARGED.
          </h2>
          <p className="text-gray-400 text-lg">
            Sledge is built as a unified AI platform that supports every part of
            the construction back office.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {cards.map((card, index) => (
            <motion.div
              key={index}
              className="relative w-full h-80 group cursor-pointer overflow-hidden rounded-2xl"
              variants={cardVariants}
              animate="normal"
              whileHover="hover"
              whileTap="hover"
            >
              <Image
                src="/images/image 21.png"
                alt={card.title}
                fill
                className="object-fill rounded-2xl"
              />

              {/* Yellow Overlay */}
              <motion.div
                className="absolute inset-0 bg-yellow-400 rounded-2xl"
                variants={overlayVariants}
                initial="visible"
                animate="visible"
              />

              {/* Content Container */}
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                initial="normal"
                whileHover="hover"
              >
                {/* Icon */}
                <motion.div className="mb-4" variants={iconVariants}>
                  <Image
                    src={card.icon}
                    alt={card.title}
                    width={119}
                    height={80}
                    className="object-contain"
                  />
                </motion.div>

                {/* Title */}
                <motion.h3
                  className="text-lg font-semibold text-yellow-400"
                  variants={titleVariants}
                >
                  {card.title}
                </motion.h3>

                {/* Subtitle */}
                <motion.p
                  className="text-sm text-white/80 text-center px-4 mt-2 max-w-xs"
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
