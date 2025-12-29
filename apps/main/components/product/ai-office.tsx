import Image from "next/image";

export function AiOffice() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12">
        {/* Left Content */}
        <div className="flex-1 text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase leading-tight sm:leading-tight md:leading-snug mb-4 sm:mb-6">
            The Builder&apos;s AI Office
          </h2>
          <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base md:text-lg">
            Construction back offices are fragmented across inboxes, accounting
            systems, spreadsheets, and disconnected tools.
          </p>
          <p className="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base md:text-lg">
            Our vision is a single AI-powered office where core operational work
            runs automatically and teams stay in control through approvals and
            oversight.
          </p>
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg">
            Sledge is building toward that future — starting with Accounts
            Payable and expanding outward.
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
