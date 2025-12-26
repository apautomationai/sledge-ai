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
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="self-stretch text-center justify-start text-white text-6xl font-bold font-['League_Spartan'] uppercase mb-12">
          WHAT OUR CUSTOMERS ARE SAYING.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="relative w-full h-[280px] group">
              <Image
                src="/images/image 21 (2).png"
                alt={testimonial.name}
                fill
                className="object-contain rounded-2xl"
              />

              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center gap-6 p-6 md:p-8">
                {/* Profile Image */}
                <div className="flex-shrink-0 ml-8">
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden">
                    <Image
                      src={testimonial.icon}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1 flex flex-col justify-center pr-6">
                  <p className="text-white text-xs md:text-sm mb-3 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <h3 className="text-white font-semibold text-sm md:text-base">
                      {testimonial.name}
                    </h3>
                    <p className="text-gray-300 text-xs md:text-sm">
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
