import Image from "next/image";

export function Testimonial() {
  const testimonials = [
    {
      icon: "/images/johnst.png",
      quote:
        "Sledge saves us over $95,000 a year and 50+ hours every week by eliminating manual invoice processing. We didn’t have to hire back-office staff just to keep up with invoices.",
      name: "Raz Danoukh",
      title: "President, Ferrocrete Builders Inc",
    },
    {
      icon: "/images/john.png",
      quote:
        "Invoice processing used to slow everything down. Now it’s automated. We save hundreds of hours a year and approvals move faster without chasing paperwork.",
      name: "Raz Danoukh",
      title: "President, Ferrocrete Builders Inc",
    },
  ];

  return (
    <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan'] text-center mb-6 md:mb-10">
          WHAT OUR CUSTOMERS ARE SAYING.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-3 2xl:gap-2">
          {testimonials.map((testimonial, index) => (
            <div key={index}>
              {/* Mobile Card Design */}
              <div className="lg:hidden p-6 bg-stone-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-neutral-600 flex flex-col justify-center items-start gap-6">
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
              <div className="hidden lg:block relative w-full h-[240px] lg:h-[280px] xl:h-[320px] 2xl:h-[360px] overflow-hidden group">
                <Image
                  src="/updated-images/container-steelplate-wide.png"
                  alt={testimonial.name}
                  fill
                  className="object-contain rounded-2xl"
                />

                {/* Content Overlay */}
                <div className="absolute inset-y-0 left-[3%] right-[3%] lg:left-[5%] lg:right-[5%] xl:left-[8%] xl:right-[8%] 2xl:left-[10%] 2xl:right-[10%] min-[1800px]:left-[14%] min-[1800px]:right-[14%] min-[2300px]:left-[18%] min-[2300px]:right-[18%] flex items-center gap-2 lg:gap-3 xl:gap-3 2xl:gap-3 min-[1800px]:gap-5 min-[2300px]:gap-4 p-3 lg:p-4 xl:p-4 2xl:p-5 min-[1800px]:p-8 min-[2300px]:p-6">
                  {/* Profile Image */}
                  <div className="flex-shrink-0 ml-1 lg:ml-2 xl:ml-2 2xl:ml-2 min-[1800px]:ml-4 min-[2300px]:ml-3">
                    <div className="relative w-[167px] h-[167px] rounded-lg overflow-hidden">
                      <Image
                        src={testimonial.icon}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center pr-2 lg:pr-3 xl:pr-4 2xl:pr-5 min-[1800px]:pr-10 min-[2300px]:pr-6 overflow-hidden">
                    <p className="text-white text-xs lg:text-sm xl:text-sm 2xl:text-base min-[1800px]:text-xl min-[2300px]:text-base mb-2 min-[1800px]:mb-3 min-[2300px]:mb-2 leading-relaxed line-clamp-3 lg:line-clamp-4">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <h3 className="text-white font-semibold text-xs lg:text-sm xl:text-sm 2xl:text-base min-[1800px]:text-xl min-[2300px]:text-base truncate">
                        {testimonial.name}
                      </h3>
                      <p className="text-gray-300 text-xs lg:text-sm xl:text-sm 2xl:text-base min-[1800px]:text-xl min-[2300px]:text-base line-clamp-2">
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
