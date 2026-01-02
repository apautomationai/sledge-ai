import Image from "next/image";

const personas = [
  {
    icon: "/images/product/icon.png",
    title: "General Contractors",
    description: "Supervises field construction",
  },
  {
    icon: "/images/product/icon (1).png",
    title: "Subcontractors",
    description: "Handles Specialized work",
  },
  {
    icon: "/images/product/icon (2).png",
    title: "Office Managers",
    description: "Keeps the office running",
  },
  {
    icon: "/images/product/icon (3).png",
    title: "Accountants &\nBookkeepers",
    description: "Takes care of the finances",
  },
];

export function SledgeFor() {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 xl:px-32 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 sm:mb-10 md:mb-12 tracking-wide leading-tight sm:leading-tight md:leading-snug">
          WHO SLEDGE IS FOR
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="bg-[#2a2a2a] rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center hover:bg-[#333333] transition-colors aspect-ratio-1"
            >
              <div className="w-[225px] h-[225px] mb-3 sm:mb-4 relative">
                <Image
                  src={persona.icon}
                  alt={persona.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-[#e3b02f] font-semibold text-base sm:text-lg md:text-xl mb-2 whitespace-pre-line">
                {persona.title}
              </h3>
              <p className="text-white text-xs sm:text-sm md:text-base">
                {persona.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
