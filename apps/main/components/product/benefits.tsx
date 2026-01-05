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
    <section className="w-full overflow-hidden py-12 md:py-16 px-6 md:px-8 lg:px-12">
      <div className="flex flex-col gap-8 items-center max-w-[1400px] mx-auto">
        <div className="w-full flex flex-col lg:flex-row items-center gap-12">
          {/* Left Image */}
          <div className="flex-1 flex justify-center">
            <Image
              src="/updated-images/image-accuracy.png"
              alt="Built for accuracy, control, and scale badge"
              width={588}
              height={588}
              className="rounded-lg"
            />
          </div>

          {/* Right Content */}
          <div className="flex-1 text-white">
            <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan'] mb-6">
              Built for Accuracy, Control, and Scale
            </h2>
            <ul className="space-y-3 text-base md:text-xl text-white">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-white">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
