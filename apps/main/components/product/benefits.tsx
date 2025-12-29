import Image from "next/image";

const benefits = [
  "AI executes the work",
  "Humans approve the outcome",
  "Every action is logged",
  "Nothing posts without approval",
  "Automation without losing control.",
];

export default function Benefits() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-20">
        {/* Left Image */}
        <div className="flex-1 flex justify-center lg:justify-start">
          <Image
            src="/images/product/Frame 104.png"
            alt="Built for accuracy, control, and scale badge"
            width={300}
            height={400}
            className="object-contain w-full max-w-[220px] sm:max-w-[260px] md:max-w-[300px]"
          />
        </div>

        {/* Right Content */}
        <div className="flex-1">
          <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight sm:leading-tight md:leading-snug mb-6 sm:mb-8">
            BUILT FOR ACCURACY,
            <br />
            CONTROL, AND SCALE
          </h2>
          <ul className="space-y-2 sm:space-y-3">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 sm:gap-3 text-white">
                <span className="text-white mt-1 sm:mt-1.5">•</span>
                <span className="text-xs sm:text-sm md:text-base">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
