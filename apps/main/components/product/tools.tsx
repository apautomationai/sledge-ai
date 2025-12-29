import Image from "next/image";

const tools = [
  {
    name: "Stripe",
    description: "Payments & financial infrastructure",
    logo: "/images/product/Stripe wordmark - White 1.png",
    logoWidth: 120,
    logoHeight: 50,
  },
  {
    name: "Outlook",
    description: "AI-powered invoice intake from email",
    logo: "/images/product/1024px-Microsoft_Outlook_logo_(2024–2025).svg 1.png",
    logoWidth: 64,
    logoHeight: 64,
  },
  {
    name: "Gmail",
    description: "Automatic invoice capture from inbox",
    logo: "/images/product/128px-Gmail_icon_(2020).svg 1.png",
    logoWidth: 64,
    logoHeight: 64,
  },
  {
    name: "QuickBooks",
    description: "AI-driven accounting sync",
    logo: "/images/product/quickbooks-brand-preferred-logo-50-50-white-external 1.png",
    logoWidth: 140,
    logoHeight: 50,
  },
];

export function Tools() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <p className="text-white text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4">
            CONSTRUCTION SOFTWARE INTEGRATIONS | AI-POWERED INTEGRATIONS –
            SLEDGE
          </p>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[64px] font-bold uppercase mb-4 sm:mb-6 leading-tight sm:leading-tight md:leading-snug ">
            WORKS WITH TOOLS YOU ALREADY USE
          </h2>
          <p className="text-white text-sm sm:text-base md:text-lg lg:text-2xl max-w-3xl lg:max-w-none mx-auto leading-relaxed">
            Sledge provides AI-powered integrations with accounting, email, and
            finance tools used by construction teams — so your back office runs
            automatically without changing how you work.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {tools.map((tool) => (
            <div
              key={tool.name}
              className="border border-gray-700 rounded-lg p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[180px] sm:min-h-[200px] hover:border-gray-500 transition-colors"
            >
              <div className="h-16 sm:h-20 flex items-center justify-center mb-3 sm:mb-4">
                <Image
                  src={tool.logo}
                  alt={`${tool.name} logo`}
                  width={tool.logoWidth}
                  height={tool.logoHeight}
                  className="object-contain"
                />
              </div>
              <h3 className="text-white font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                {tool.name}
              </h3>
              <p className="text-white text-xs sm:text-sm">
                {tool.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer text */}
        <p className="text-center text-white text-xs sm:text-sm">
          New integrations are added continuously as we expand the
          Builder&apos;s AI Office.
        </p>
      </div>
    </section>
  );
}
