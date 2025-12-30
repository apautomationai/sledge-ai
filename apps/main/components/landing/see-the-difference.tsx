"use client";

import { useState } from "react";
import Image from "next/image";

export default function SeeTheDifference() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));

    setSliderPosition(percent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !e.touches[0]) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(
      0,
      Math.min(e.touches[0].clientX - rect.left, rect.width),
    );
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));

    setSliderPosition(percent);
  };

  return (
    <div className="flex flex-col gap-8 items-center py-4 md:py-4 lg:py-8 xl:py-16 2xl:py-16 max-w-8xl overflow-hidden px-4 md:px-14 ">
      <div className="flex flex-col gap-4 px-4 sm:px-6 lg:px-8">
        <div className="self-stretch text-center justify-start text-white text-3xl sm:text-4xl md:text-5xl lg:text-[48px] font-bold font-['League_Spartan'] uppercase leading-tight sm:leading-tight md:leading-[52px] lg:leading-none">
          SEE THE DIFFERENCE WITH SLEDGE.
        </div>
        <div className="self-stretch text-center justify-start text-white text-base sm:text-lg md:text-xl lg:text-2xl font-normal font-['Inter'] leading-relaxed sm:leading-relaxed md:leading-8">
          Manual construction back offices vs. AI-powered workflows with Sledge.
        </div>
      </div>

      <div
        className="relative w-full aspect-video select-none overflow-hidden rounded-lg"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        {/* After 10 Image (Background - Right side) */}
        <div className="absolute inset-0">
          <Image
            src="/images/after 10.png"
            alt="AI workflow automation"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* After 9 Image (Foreground with clip - Left side) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <Image
            src="/images/after 9.png"
            alt="construction back office automation"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1.5 bg-white cursor-ew-resize"
          style={{
            left: `${sliderPosition}%`,
          }}
        >
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex gap-1 items-center">
              {/* Left arrow triangle */}
              <div className="w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-black" />
              {/* Right arrow triangle */}
              <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-black" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
