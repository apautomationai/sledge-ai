import Image from "next/image";

export function Cards() {
  const cards = [
    {
      icon: "/images/image 12.png",
      title: "Money",
      subtile: "Automate invoices, payables, & approvals ",
    },
    {
      icon: "/images/person2.png",
      title: "People",
      subtile: "Ai handles reminders and scheduling",
    },
    {
      icon: "/images/image 13.png",
      title: "Docs",
      subtile: "Instantly scan, sort and search every file",
    },
    {
      icon: "/images/job2.png",
      title: "Projects",
      subtile: "Automate invoices, payables, & approvals ",
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            YOUR ENTIRE OPERATION, SUPERCHARGED.
          </h2>
          <p className="text-gray-400 text-lg">
            Sledge is built as a unified AI platform that supports every part of
            the construction back office.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((card, index) => (
            <div key={index} className="relative w-full h-[320px] group">
              <Image
                src="/images/image 21.png"
                alt={card.title}
                fill
                className="object-fill rounded-2xl"
              />

              {/* Overlay with icon and title */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  <Image
                    src={card.icon}
                    alt={card.title}
                    width={119}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-yellow-400">
                  {card.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
