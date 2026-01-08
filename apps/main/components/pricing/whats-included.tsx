import { Check } from "lucide-react";

export interface FeatureWithDescription {
  title: string;
  description: string;
}

export interface WhatsIncludedProps {
  title?: string;
  text?: string;
  subtitle?: string;
  features?: string[] | FeatureWithDescription[];
  afterText?: string;
  columns?: 2 | 3;
}

export function WhatsIncluded({
  title,
  text,
  subtitle,
  features,
  afterText,
  columns = 2,
}: WhatsIncludedProps) {
  const gridColsClass = columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";

  return (
    <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        {(title || text) && (
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            {title && (
              <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase mb-3 sm:mb-4 font-['League_Spartan']">
                {title}
              </h2>
            )}
            {text && (
              <p className="mt-2 text-base md:text-2xl text-white">{text}</p>
            )}
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="text-left text-lg md:text-2xl text-white mb-4 font-bold">
            {subtitle}
          </p>
        )}

        {/* Features Grid */}
        {features && features.length > 0 && (
          <div className={`grid grid-cols-1 ${gridColsClass} gap-4`}>
            {features.map((feature, index) => {
              const isStringFeature = typeof feature === 'string';
              return (
                <div
                  key={index}
                  className="flex gap-3 bg-[#1B1A17] p-8 rounded"
                >
                  <Check className="w-5 h-5 text-[#e3b02f] shrink-0 mt-1" strokeWidth={3} />
                  {isStringFeature ? (
                    <span className="text-sm font-bold md:text-base lg:text-lg text-[#e3b02f]">
                      {feature}
                    </span>
                  ) : (
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold text-[#e3b02f] mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm lg:text-base text-white leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* After Text */}
        {afterText && (
          <p className="text-center text-lg text-gray-200 mt-6">
            {afterText}
          </p>
        )}
      </div>
    </section>
  );
}
