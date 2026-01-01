import Image from "next/image";

export function AiOffice() {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-8 sm:gap-10 lg:gap-12">
        {/* Left Content */}
        <div className="flex-1 text-white">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan'] mb-6">
            The Builder&apos;s AI Office
          </h2>
          <p className="text-lg md:text-2xl text-white mb-6">
            Construction back offices are fragmented across inboxes, accounting
            systems, spreadsheets, and disconnected tools.
          </p>
          <p className="text-lg md:text-2xl text-white mb-6">
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
