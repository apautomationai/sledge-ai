"use client";

import Image from "next/image";

export interface Step {
  icon?: string;
  title?: string;
  description?: string;
}

export interface AIFoundationWorkingProps {
  title?: string;
  text?: string;
  steps?: Step[];
  bgColor?: string;
}

export function AIFoundationWorking({
  title,
  text,
  steps,
  bgColor,
}: AIFoundationWorkingProps) {
  const gridCols =
    steps?.length === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-3";

  return (
    <section
      className={`w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 ${bgColor || ""}`}
    >
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        {(title || text) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan']">
                {title}
              </h2>
            )}
            {text && (
              <p className="mt-2 text-lg md:text-2xl text-white">{text}</p>
            )}
          </div>
        )}

        {/* Cards */}
        {steps && steps.length > 0 && (
          <div className={`grid grid-cols-1 ${gridCols} gap-4 sm:gap-6`}>
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-[#1B1A17] border border-[#333] rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center w-full min-h-[380px] sm:min-h-[420px] md:min-h-[448px]"
              >
                {/* Icon */}
                {step.icon && (
                  <div className="w-[160px] h-[160px] sm:w-[190px] sm:h-[190px] md:w-[225px] md:h-[225px] mb-4 sm:mb-6 relative">
                    <Image
                      src={step.icon}
                      alt={step.title || ""}
                      width={225}
                      height={225}
                      className="object-contain w-full h-full"
                    />
                  </div>
                )}

                {/* Title */}
                {step.title && (
                  <h3 className="text-[#E3B02F] text-base sm:text-lg md:text-xl font-semibold mb-1">
                    {step.title}
                  </h3>
                )}

                {/* Description */}
                {step.description && (
                  <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
