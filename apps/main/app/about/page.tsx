import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Target, Eye, Users, Lightbulb, Shield, Zap } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const founders = [
    {
      firstName: "DAVIS",
      lastName: "CANNON",
      title: "Co-Founder",
      image: "/images/founders/Davis.jpg",
    },
    {
      firstName: "MATTEO",
      lastName: "MIRALAIE",
      title: "Co-Founder",
      image: "/images/founders/Matteo.jpg",
    },
    {
      firstName: "RAZ",
      lastName: "DANOUKH",
      title: "Co-Founder",
      image: "/images/founders/Raz.jpg",
    },
  ];

  const principles = [
    {
      icon: Lightbulb,
      title: "AI-Native From the Ground Up",
      description:
        "Sledge is AI construction management software built with AI at its core — not added later. AI runs the workflows so builders don't have to.",
    },
    {
      icon: Shield,
      title: "No Gatekeeping. Ever.",
      description:
        "No revenue percentages. No enterprise lock-in. No pricing builders out of the market.",
    },
    {
      icon: Target,
      title: "One Platform. End to End.",
      description:
        "Run your entire construction business — from company setup to projects, accounting, operations, and scale — in one platform.",
    },
    {
      icon: Zap,
      title: "Minimal Manual Work",
      description:
        "Autonomous AI handles invoices, accounting, documents, and approvals — so you spend less time in the office and more time building.",
    },
    {
      icon: Users,
      title: "Built for Builders",
      description:
        "Designed for contractors, trades, and jobbers — not boardrooms or procurement committees.",
    },
    {
      icon: Eye,
      title: "Scales With You",
      description:
        "Start small or run at enterprise scale. Sledge grows with your business without forcing migrations or complexity.",
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen relative overflow-hidden">
        {/* Fixed background image */}
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: "url('/images/gpt4.png')",
            zIndex: -1,
          }}
        />
        {/* Black overlay with opacity */}
        <div
          className="fixed inset-0 bg-black pointer-events-none"
          style={{
            opacity: 0.7,
            zIndex: -1,
          }}
        />

        {/* Main Content */}
        <div className="relative w-full py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* About Us Header Section */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center justify-center gap-2 mb-6">
                <Image
                  src="/images/logos/logo-sledge-symbol-custom.svg"
                  alt="Sledge Logo"
                  width={56}
                  height={56}
                  className="w-12 h-12"
                />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 uppercase font-['League_Spartan']">
                ABOUT US
              </h1>
              <p className="text-2xl md:text-3xl text-[#e3b02f] font-bold uppercase font-['League_Spartan']">
                SLEDGE: THE BUILDER'S AI OFFICE
              </p>
              <div className="text-lg text-white max-w-4xl mx-auto mt-6 leading-relaxed space-y-4">
                <p className="font-semibold">
                  Sledge is AI construction management software that automates the construction back office.
                </p>
                <p>
                  We replace manual, outdated workflows with AI-powered systems — so builders can run their businesses faster, with fewer tools and less overhead.
                </p>
                <p className="text-white font-bold">
                  Built by builders. For builders.
                </p>
              </div>
            </div>

            {/* Why We Exist Section - No card, just content */}
            <div className="mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-[#e3b02f] mb-6 uppercase font-['League_Spartan'] flex items-center gap-3">
                <Target className="w-8 h-8" />
                Why We Exist
              </h2>
              <div className="space-y-4 text-white text-base md:text-lg leading-relaxed">
                <p className="font-bold">
                  Construction runs the real world — but the software running construction is broken.
                </p>
                <p>
                  Most construction management and accounting tools today are:
                </p>
                <div className="space-y-2 pl-4">
                  <p className="flex items-center gap-3">
                    <span className="text-[#e3b02f] font-bold">•</span>
                    <span>Overpriced</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="text-[#e3b02f] font-bold">•</span>
                    <span>Bloated</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="text-[#e3b02f] font-bold">•</span>
                    <span>Built for executives, not builders.</span>
                  </p>
                </div>
                <p>
                  Builders shouldn't need enterprise contracts, long implementations, or complicated systems just to run their business.
                </p>
                <p className="font-bold">
                  Sledge exists to automate the construction back office — and give builders tools that actually meet their real needs.
                </p>
              </div>
            </div>

            {/* Vision & Mission Grid - No cards, simple layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
              {/* Vision */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#e3b02f] flex items-center justify-center">
                    <Eye className="w-6 h-6 text-zinc-900" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#e3b02f] uppercase font-['League_Spartan']">
                    Vision
                  </h2>
                </div>
                <p className="text-white text-base leading-relaxed font-bold">
                  Our vision is to make modern construction management software accessible to every builder.
                </p>
                <p className="text-white text-base leading-relaxed mt-4">
                  From first-time contractors to large firms, anyone should be able to start, run, and scale a construction business without expensive, overcomplicated tools.
                </p>
              </div>

              {/* Mission */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#e3b02f] flex items-center justify-center">
                    <Target className="w-6 h-6 text-zinc-900" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#e3b02f] uppercase font-['League_Spartan']">
                    Mission
                  </h2>
                </div>
                <p className="text-white text-base leading-relaxed font-bold">
                  Our mission is to eliminate construction back-office work using AI.
                </p>
                <p className="text-white text-base leading-relaxed mt-4">
                  We put the power of running a construction company back where it belongs — in the hands of the builder.
                </p>
              </div>
            </div>

            {/* Founders Section */}
            <div className="mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-[#e3b02f] mb-8 md:mb-12 uppercase font-['League_Spartan'] text-center">
                Founders
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6">
                {founders.map((founder) => (
                  <div
                    key={founder.firstName}
                    className="bg-[#1b1a17] border border-[#4a4a4a] rounded-lg p-4 md:p-8 text-center"
                  >
                    <div className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden border-2 md:border-4 border-[#e3b02f] bg-zinc-800">
                      <Image
                        src={founder.image}
                        alt={`${founder.firstName} ${founder.lastName}`}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xs md:text-xl font-bold text-white uppercase font-['League_Spartan'] mb-1 md:mb-2 leading-tight">
                      <span className="block md:inline">
                        {founder.firstName}
                      </span>
                      <span className="hidden md:inline"> </span>
                      <span className="block md:inline">
                        {founder.lastName}
                      </span>
                    </h3>
                    <p className="text-[#e3b02f] text-[10px] md:text-sm uppercase font-semibold">
                      {founder.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Principles & Values Section */}
            <div className="mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-[#e3b02f] mb-12 uppercase font-['League_Spartan'] text-center">
                Principles & Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {principles.map((principle) => (
                  <div
                    key={principle.title}
                    className="bg-[#1b1a17] border border-[#4a4a4a] rounded-lg p-6 flex flex-col items-center h-full"
                  >
                    <div className="w-14 h-14 bg-[#e3b02f] flex items-center justify-center mb-4">
                      <principle.icon className="w-7 h-7 text-zinc-900" />
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase font-['League_Spartan'] mb-3 text-center">
                      {principle.title}
                    </h3>
                    <p className="text-zinc-300 text-sm leading-relaxed text-center">
                      {principle.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
