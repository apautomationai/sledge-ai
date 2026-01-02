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
}

export function AIFoundationWorking({
  title,
  text,
  steps,
}: AIFoundationWorkingProps) {
  const gridCols =
    steps?.length === 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3";

  return (
    <section className="w-full px-6 md:px-8 lg:px-12 xl:px-32 py-12 md:py-16">
      <div className="w-full max-w-8xl mx-auto">
        {/* Header */}
        {(title || text) && (
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white uppercase tracking-wide mb-3 sm:mb-4 leading-tight sm:leading-tight md:leading-snug">
                {title}
              </h2>
            )}
            {text && (
              <p className="text-white text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                {text}
              </p>
            )}
          </div>
        )}

        {/* Cards */}
        {steps && steps.length > 0 && (
          <div
            className={`grid grid-cols-1 ${gridCols} gap-4 sm:gap-6 justify-items-center`}
          >
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-[#1B1A17] border border-[#333] rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center w-full max-w-[432px] min-h-[380px] sm:min-h-[420px] md:h-[448px]"
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
