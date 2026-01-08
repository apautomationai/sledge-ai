import Image from "next/image";

const personas = [
  {
    icon: "/images/image 34.svg",
    title: "General Contractors",
    description: "Supervises field construction",
  },
  {
    icon: "/images/image 35.svg",
    title: "Subcontractors",
    description: "Handles Specialized work",
  },
  {
    icon: "/images/image 36.svg",
    title: "Office Managers",
    description: "Keeps the office running",
  },
  {
    icon: "/images/image 37.svg",
    title: "Accountants &\nBookkeepers",
    description: "Takes care of the finances",
  },
];

export function SledgeFor() {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white text-center uppercase font-['League_Spartan'] mb-12">
          WHO SLEDGE IS FOR
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
              <h3 className="text-[#e3b02f] font-semibold text-xl mb-2 whitespace-pre-line">
                {persona.title}
              </h3>
              <p className="text-white text-base">{persona.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
