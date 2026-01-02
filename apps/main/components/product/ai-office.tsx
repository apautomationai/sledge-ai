import Image from "next/image";

export function AiOffice() {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 xl:px-32 py-12 md:py-16">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12">
        {/* Left Content */}
        <div className="flex-1 text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase leading-tight sm:leading-tight md:leading-snug mb-4 sm:mb-6">
            The Builder&apos;s AI Office
          </h2>
          <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base ">
            Construction back offices are fragmented across inboxes, accounting
            systems, spreadsheets, and disconnected tools.
          </p>
          <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
            Our vision is a single AI-powered office where core operational work
            runs automatically and teams stay in control through approvals and
            oversight.
          </p>
        </div>

        {/* Right Image */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <Image
            src="/images/product/image-sledge-to-accounts-payable-module.png"
            alt="Sledge AI Office"
            width={588}
            height={588}
            className="object-contain w-full max-w-[400px] sm:max-w-[500px] md:max-w-[588px]"
          />
        </div>
      </div>
    </section>
  );
}
