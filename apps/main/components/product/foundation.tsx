import Image from "next/image";

export function Foundation() {
  return (
    <section className="w-full overflow-hidden py-12 md:py-16 px-6 md:px-8 lg:px-12">
      <div className="flex flex-col gap-8 items-center max-w-[1400px] mx-auto">
      <div className="w-full flex flex-col lg:flex-row items-center gap-12">
        {/* Left Content */}
        <div className="flex-1 text-white">
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan'] mb-6">
            An AI Foundation Built for the Construction Back Office
          </h2>
          <p className="text-base md:text-xl text-white mb-6">
            Sledge is built on an autonomous, event-driven AI foundation that
            operates behind the scenes. AI continuously monitors incoming work,
            interprets unstructured data, executes workflows automatically, and
            pauses only when human approval is required.<br></br>This AI
            foundation powers everything in the platform — today and in the
            future.
          </p>

          <ul className="space-y-3 text-base md:text-xl text-white">
            <li className="flex items-start gap-2">
              <span className="text-white">•</span>
              <span>AI acts automatically on real business events</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white">•</span>
              <span>No prompts, chat, or manual triggers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white">•</span>
              <span>Human-in-the-loop approval for control</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white">•</span>
              <span>
                Designed to support multiple back-office workflows over time
              </span>
            </li>
          </ul>
        </div>

        {/* Right Image */}
        <div className="flex-1 flex justify-end">
          <Image
            src="/images/product/image-ai-back-office-tower.png"
            alt="AI Back Office Tower"
            width={500}
            height={500}
            className="rounded-lg"
          />
        </div>
      </div>
      </div>
    </section>
  );
}
