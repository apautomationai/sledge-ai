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
    <section className="w-full py-4 md:py-4 lg:py-8 xl:py-16 2xl:py-16 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 sm:mb-10 md:mb-12 tracking-wide leading-tight sm:leading-tight md:leading-snug">
          WHO SLEDGE IS FOR
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="bg-[#2a2a2a] rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center hover:bg-[#333333] transition-colors"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-3 sm:mb-4 relative">
                <Image
                  src={persona.icon}
                  alt={persona.title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-[#f5a623] font-semibold text-base sm:text-lg md:text-xl mb-2 whitespace-pre-line">
                {persona.title}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">
                {persona.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
