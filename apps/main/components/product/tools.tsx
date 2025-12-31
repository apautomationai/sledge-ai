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
    <section className="w-full px-6 md:px-8 lg:px-12 xl:px-32 py-12 md:py-16">
      <div className="mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <p className="text-white text-xs sm:text-sm tracking-widest uppercase mb-3 sm:mb-4">
            CONSTRUCTION SOFTWARE INTEGRATIONS | AI-POWERED INTEGRATIONS –
            SLEDGE
          </p>
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-[58px] font-bold uppercase mb-4 sm:mb-6 leading-tight sm:leading-tight md:leading-snug ">
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
              className="h-80 p-8 bg-stone-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-600 inline-flex flex-col justify-center items-center gap-4 overflow-hidden hover:outline-neutral-500 transition-colors"
            >
              <div className="w-48 h-16 relative overflow-hidden flex items-center justify-center">
                <Image
                  src={tool.logo}
                  alt={`${tool.name} logo`}
                  width={tool.logoWidth}
                  height={tool.logoHeight}
                  className="object-contain"
                />
              </div>
              <div className="self-stretch flex flex-col justify-center items-center gap-2">
                <div className="self-stretch text-center text-white text-2xl font-normal font-sans">
                  {tool.name}
                </div>
                <p className="text-white text-sm text-center">
                  {tool.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
