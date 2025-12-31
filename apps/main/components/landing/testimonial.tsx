import Image from "next/image";

export function Testimonial() {
  const testimonials = [
    {
      icon: "/images/johnst.png",
      quote:
        "Sledge has been a game-changer for our operations. It has significantly boosted productivity across our organization.",
      name: "John St",
      title: "President, Ferrocrete Builders Inc",
    },
    {
      icon: "/images/john.png",
      quote:
        "After trying multiple management tools, we finally found the one. The ease of use is a delight that is very welcome in industry.",
      name: "John McDaniel",
      title: "Project Manager, Ferrocrete Builders Inc",
    },
  ];

  return (
    <section className="w-full py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="self-stretch text-center justify-start text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-['League_Spartan'] uppercase mb-2 sm:mb-6 md:mb-10 leading-tight">
          WHAT OUR CUSTOMERS ARE SAYING.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index}>
              {/* Mobile Card Design */}
              <div className="md:hidden p-6 bg-stone-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-600 flex flex-col justify-center items-start gap-6">
                <p className="text-white text-base font-normal font-['Inter'] leading-6">
                  "{testimonial.quote}"
                </p>
                <div className="w-full flex justify-start items-center gap-4">
                  <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                    <Image
                      src={testimonial.icon}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-1">
                    <h3 className="text-white text-sm font-bold font-['Inter'] leading-5">
                      {testimonial.name}
                    </h3>
                    <p className="text-white text-sm font-normal font-['Inter'] leading-5">
                      {testimonial.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Image Design */}
              <div className="hidden md:block relative w-full h-[240px] lg:h-[280px] xl:h-[300px] overflow-hidden group">
                <Image
                  src="/images/image 21 (2).png"
                  alt={testimonial.name}
                  fill
                  className="object-contain rounded-2xl"
                />

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center gap-3 lg:gap-4 xl:gap-6 p-4 lg:p-6 xl:p-8">
                  {/* Profile Image */}
                  <div className="flex-shrink-0 ml-2 lg:ml-3 xl:ml-6">
                    <div className="relative w-20 h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 rounded-lg overflow-hidden">
                      <Image
                        src={testimonial.icon}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 flex flex-col justify-center pr-3 lg:pr-4 xl:pr-6 overflow-hidden">
                    <p className="text-white text-xs lg:text-sm xl:text-base mb-2 lg:mb-3 leading-relaxed line-clamp-3 lg:line-clamp-4">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <h3 className="text-white font-semibold text-xs lg:text-sm xl:text-base truncate">
                        {testimonial.name}
                      </h3>
                      <p className="text-gray-300 text-xs lg:text-sm line-clamp-2">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
