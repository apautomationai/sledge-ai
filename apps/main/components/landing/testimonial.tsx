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
    <section className="px-4 sm:px-6 md:px-12 lg:px-20 py-4 md:py-4 lg:py-8 xl:py-16 2xl:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="self-stretch text-center justify-start text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-['League_Spartan'] uppercase mb-2 sm:mb-6 md:mb-10 leading-tight">
          WHAT OUR CUSTOMERS ARE SAYING.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative w-full h-[200px] md:h-[240px] lg:h-[280px] xl:h-[300px] overflow-hidden group"
            >
              <Image
                src="/images/image 21 (2).png"
                alt={testimonial.name}
                fill
                className="object-contain rounded-2xl"
              />

              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center gap-1.5 sm:gap-3 md:gap-3 lg:gap-4 xl:gap-6 p-2 sm:p-4 md:p-4 lg:p-6 xl:p-8">
                {/* Profile Image */}
                <div className="flex-shrink-0 ml-4 sm:ml-0 md:ml-2 lg:ml-3 xl:ml-6">
                  <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 rounded-lg overflow-hidden">
                    <Image
                      src={testimonial.icon}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 flex flex-col justify-center pr-3 sm:pr-2 md:pr-3 lg:pr-4 xl:pr-6 overflow-hidden">
                  <p className="text-white text-[9px] sm:text-xs md:text-xs lg:text-sm xl:text-base mb-1 sm:mb-2 md:mb-2 lg:mb-3 leading-relaxed line-clamp-3 sm:line-clamp-3 md:line-clamp-3 lg:line-clamp-4">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <h3 className="text-white font-semibold text-[10px] sm:text-xs md:text-xs lg:text-sm xl:text-base truncate">
                      {testimonial.name}
                    </h3>
                    <p className="text-gray-300 text-[9px] sm:text-xs md:text-xs lg:text-sm line-clamp-2">
                      {testimonial.title}
                    </p>
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
