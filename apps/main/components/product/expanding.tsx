import Image from "next/image";
import Link from "next/link";

export function Expanding() {
  const liveToday = {
    title: "Live Today",
    icon: "/images/icon-check-badge-square (1).svg",
    items: [
      "AI-powered Accounts Payable workflows",
      "Automated invoice capture and parsing",
      "Human-in-the-loop approvals",
      "Accounting system integration",
    ],
    link: {
      text: "View AI Accounts Payable",
      href: "product/ai-accounts-payable",
    },
  };

  const buildingToward = {
    title: "What We're Building Toward",
    icon: "/images/icon-check-badge-square.svg",
    items: [
      "A unified AI-driven back office",
      "Additional document and workflow automation",
      "Deeper system integrations",
      "Expanded AI-powered execution across operations",
    ],
  };

  return (
    <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white text-center uppercase font-['League_Spartan'] mb-12">
          Built Today. Expanding Tomorrow.
        </h2>

        {/* Cards Container */}
        <div className="flex flex-col lg:flex-row justify-center gap-6 sm:gap-8 lg:gap-[48px]">
          {/* Live Today Card */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 md:p-10 w-full lg:w-[660px] lg:h-[512px]">
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center h-[240px] sm:h-[280px] md:h-[300px] lg:h-[300px]">
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-white  mb-2 sm:mb-3 md:mb-4 text-center">
                  {liveToday.title}
                </h3>
                <div className="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[200px] md:h-[200px] lg:w-[225px] lg:h-[225px]">
                  <Image
                    src={liveToday.icon}
                    alt={liveToday.title}
                    width={225}
                    height={225}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
              <ul className="space-y-1.5 sm:space-y-2">
                {liveToday.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 sm:gap-3">
                    <span className="text-white mt-0.5">•</span>
                    <span className="text-gray-300 text-xs sm:text-sm md:text-base">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={liveToday.link.href}
                className="cursor-pointer mt-auto text-[#E3B02F] hover:text-[#f0c04a] transition-colors text-xs sm:text-sm md:text-base font-medium flex items-center gap-2"
              >
                {liveToday.link.text}
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Building Toward Card */}
          <div className="bg-[#1b1a17] border border-[#4a4a4a] rounded-lg p-6 sm:p-8 md:p-10 w-full lg:w-[660px] lg:h-[512px]">
            <div className="flex flex-col h-full items-center gap-2">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-[32px] font-bold text-white mb-0 text-center capitalize leading-normal">
                {buildingToward.title}
              </h3>
              <div className="w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[200px] md:h-[200px] lg:w-[225px] lg:h-[225px]">
                <Image
                  src={buildingToward.icon}
                  alt={buildingToward.title}
                  width={225}
                  height={225}
                  className="object-contain w-full h-full"
                />
              </div>
              <ul className="space-y-2 w-full px-0 py-1">
                {buildingToward.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 sm:gap-3">
                    <span className="text-white mt-0.5">•</span>
                    <span className="text-white text-sm sm:text-base md:text-lg leading-6">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
