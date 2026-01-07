import Image from "next/image";
import Link from "next/link";

const tools = [
  {
    name: "Outlook",
    description: "AI-powered invoice intake from email",
    logo: "/images/1024px-Microsoft_Outlook_logo_(2024–2025).svg 1.svg",
    logoWidth: 64,
    logoHeight: 64,
    href: "/integration/outlook",
  },
  {
    name: "Gmail",
    description: "Automatic invoice capture from inbox",
    logo: "/images/128px-Gmail_icon_(2020).svg 1.svg",
    logoWidth: 64,
    logoHeight: 64,
    href: "/integration/gmail",
  },
  {
    name: "QuickBooks",
    description: "AI-driven accounting sync",
    logo: "/images/quickbooks-brand-preferred-logo-50-50-white-external 1.svg",
    logoWidth: 140,
    logoHeight: 50,
    href: "/integration/quickbooks",
  },
];

export function Tools() {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <p className="text-sm md:text-md lg:text-lg text-gray-300">
            CONSTRUCTION SOFTWARE INTEGRATIONS | AI-POWERED INTEGRATIONS –
            SLEDGE
          </p>
          <h2 className="mt-2 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase font-['League_Spartan']">
            WORKS WITH TOOLS YOU ALREADY USE
          </h2>
          <p className="mt-2 md:mt-2 text-lg lg:text-2xl text-white">
            Sledge provides AI-powered integrations with accounting, email, and
            finance tools used by construction teams — so your back office runs
            automatically without changing how you work.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
