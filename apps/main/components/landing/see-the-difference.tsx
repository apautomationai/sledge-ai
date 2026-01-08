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
    <div className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto overflow-hidden">
        <div className="text-center">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan']">
            SEE THE DIFFERENCE WITH SLEDGE.
          </h2>
          <p className="mt-2 text-lg md:text-2xl text-white">
            Manual construction back offices vs. AI-powered workflows with
            Sledge.
          </p>
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
          {/* After Image (Background - Right side) */}
          <div className="absolute inset-0">
            <Image
              src="/images/sledge-difference-after.svg"
              alt="AI-powered construction back office automation with Sledge"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Before Image (Foreground with clip - Left side) */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
            }}
          >
            <Image
              src="/images/sledge-difference-before.svg"
              alt="Manual construction back office"
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
    </div>
  );
}
