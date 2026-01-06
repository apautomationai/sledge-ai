"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Arrow from "@/public/icon-components/arrow";

export function HowItWorks() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const cards = [
    {
      icon: "/images/product/icon-display-email-capture.png",
      title: "1. AI Intake",
      description:
        "AI automatically captures emails, documents, and attachments as they arrive.",
    },
    {
      icon: "/images/product/icon-display-ai-understand.png",
      title: "2. AI Understanding",
      description:
        "AI interprets unstructured data and maps it into structured business context.",
    },
    {
      icon: "/images/product/icon-display-checklist.png",
      title: "3. AI Routing",
      description:
        "AI prepares work for completion and pauses for approval when required.",
    },
    {
      icon: "/images/product/icon-capture 2 (1).png",
      title: "4. Human Review",
      description:
        "AI prepares work for completion and pauses for approval when required.",
    },
    {
      icon: "/images/product/quickbooks-brand-preferred-logo-50-50-white-external 1.png",
      title: "5. 1-Click Sync",
      description:
        "AI prepares work for completion and pauses for approval when required.",
    },
  ];

  // Create infinite loop by duplicating cards
  const infiniteCards = [...cards, ...cards, ...cards];
  const gapSize = 24; // 24px gap between cards (gap-6)
  const totalGaps = (cardsToShow - 1) * gapSize;

  // Update cards to show based on screen size
  useEffect(() => {
    const updateCardsToShow = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);

      if (width < 768) {
        setCardsToShow(1); // Mobile
        setCurrentIndex(cards.length); // Start at middle set
      } else if (width < 1024) {
        setCardsToShow(2); // Tablet
        setCurrentIndex(cards.length);
      } else if (width < 1280) {
        setCardsToShow(3); // Medium
        setCurrentIndex(cards.length);
      } else {
        setCardsToShow(4); // Large
        setCurrentIndex(cards.length);
      }
    };

    updateCardsToShow();
    window.addEventListener("resize", updateCardsToShow);
    return () => window.removeEventListener("resize", updateCardsToShow);
  }, [cards.length]);

  // Handle infinite loop wrapping
  useEffect(() => {
    if (!isTransitioning) return;

    if (currentIndex <= 0) {
      // Jump to the end of the first set (without animation)
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(cards.length);
      }, 300);
    } else if (currentIndex >= cards.length * 2) {
      // Jump to the start of the second set (without animation)
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(cards.length);
      }, 300);
    }
  }, [currentIndex, cards.length, isTransitioning]);

  // Re-enable transition after jump
  useEffect(() => {
    if (!isTransitioning) {
      const timeout = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  const handlePrev = () => {
    if (isTransitioning) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (isTransitioning) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <section className="w-full px-6 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 ">
      <div className="w-full max-w-[1900px] mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan']">
            How It Works
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 z-10 w-8 h-8 sm:w-16 sm:h-16 sm:rounded-lg sm:bg-[#1F1F1F] sm:border sm:border-[#333] flex items-center justify-center transition-all opacity-100 cursor-pointer sm:hover:bg-[#2A2A2A]"
            style={{
              transform: isMobile
                ? "translateX(-8px) translateY(-50%)"
                : "translateX(-36px) translateY(-50%)"
            }}
            aria-label="Previous"
          >
            <Arrow />
          </button>

          {/* Cards Container */}
          <div className="overflow-hidden relative">
            <div
              className="flex gap-6"
              style={{
                transform: `translateX(calc(-${currentIndex} * (calc((100% - ${totalGaps}px) / ${cardsToShow}) + ${gapSize}px)))`,
                transition: isTransitioning ? "transform 300ms ease-in-out" : "none",
              }}
            >
              {infiniteCards.map((card, index) => (
                <div
                  key={index}
                  className="relative bg-[#1B1A17] border border-[#333] rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center min-h-[380px] sm:min-h-[420px] md:min-h-[448px] shrink-0"
                  style={{
                    width: `calc((100% - ${totalGaps}px) / ${cardsToShow})`,
                  }}
                >
                  {/* Icon */}
                  <div className="w-[160px] h-[160px] sm:w-[190px] sm:h-[190px] md:w-[225px] md:h-[225px] mb-4 sm:mb-6 relative">
                    <Image
                      src={card.icon}
                      alt={card.title}
                      width={225}
                      height={225}
                      className="object-contain w-full h-full"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-[#E3B02F] text-base sm:text-lg md:text-xl font-semibold mb-1">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed">
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 z-10 w-8 h-8 sm:w-16 sm:h-16 sm:rounded-lg sm:bg-[#1F1F1F] sm:border sm:border-[#333] flex items-center justify-center transition-all opacity-100 cursor-pointer sm:hover:bg-[#2A2A2A]"
            style={{
              transform: isMobile
                ? "translateX(8px) translateY(-50%)"
                : "translateX(36px) translateY(-50%)"
            }}
            aria-label="Next"
          >
            <div className="rotate-180">
              <Arrow />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
