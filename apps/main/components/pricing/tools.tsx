import Image from "next/image";

const tools = [
  {
    src: "/images/product/Stripe wordmark - White 1.png",
    alt: "Stripe",
    width: 190,
    height: 64,
  },
  {
    src: "/images/product/1024px-Microsoft_Outlook_logo_(2024–2025).svg 1.png",
    alt: "Microsoft Outlook",
    width: 90,
    height: 64,
  },
  {
    src: "/images/product/128px-Gmail_icon_(2020).svg 1.png",
    alt: "Gmail",
    width: 85,
    height: 64,
  },
  {
    src: "/images/product/quickbooks-brand-preferred-logo-50-50-white-external 1.png",
    alt: "QuickBooks",
    width: 251,
    height: 64,
  },
];

export function PricingTools() {
  return (
    <section className="py-4 md:py-4 lg:py-8 xl:py-16 2xl:py-16 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h2 className="text-xl sm:text-2xl md:text-[32px] font-bold font-league-spartan text-white uppercase text-center mb-8 sm:mb-10 md:mb-12">
          Built to work with tools you use
        </h2>

        {/* Tools Logos */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-16 xl:gap-20">
          {tools.map((tool, index) => (
            <div key={index} className="flex items-center justify-center">
              <Image
                src={tool.src}
                alt={tool.alt}
                width={tool.width}
                height={tool.height}
                className="object-contain w-auto h-8 sm:h-10 md:h-12 lg:h-16"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
