import Link from "next/link";

const tools = [
  {
    name: "Outlook",
    description: "AI-powered invoice intake from email",
    logo: "/images/1024px-Microsoft_Outlook_logo_(2024–2025).svg 1.svg",
    href: "/integration/outlook",
  },
  {
    name: "Gmail",
    description: "Automatic invoice capture from inbox",
    logo: "/images/128px-Gmail_icon_(2020).svg 1.svg",
    href: "/integration/gmail",
  },
  {
    name: "QuickBooks",
    description: "AI-driven accounting sync",
    logo: "/images/quickbooks-brand-preferred-logo-50-50-white-external 1.svg",
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
              <img className=" object-contain" src={tool.logo} alt={`${tool.name} logo`} />
              <div className="self-stretch flex flex-col justify-center items-center gap-2">
                <div className="self-stretch text-center justify-start text-white text-xl font-bold font-['Inter'] leading-7">
                  {tool.name}
                </div>
                <div className="self-stretch text-center justify-start text-white text-lg font-normal font-['Inter'] leading-6">
                  {tool.description}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-lg text-gray-200">
          New integrations are added continuously as we expand the Builder's AI Office.
        </p>
      </div>
    </section>
  );
}
