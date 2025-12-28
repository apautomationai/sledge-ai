export default function WhatIsIt() {
  return (
    <div className="p-2 sm:p-4 bg-neutral-900 inline-flex flex-col justify-start items-start gap-2">
      <div className="self-stretch py-8 sm:py-12 md:py-16 inline-flex flex-col justify-start items-center gap-2 sm:gap-4">
        <div className="max-w-[1440px] px-4 sm:px-6 md:px-8 flex flex-col justify-start items-center gap-3 sm:gap-4 md:gap-6">
          <div className="self-stretch text-center justify-start text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-league-spartan uppercase leading-tight sm:leading-snug md:leading-[52px]">
            AI-Powered Back Office Software for Construction
          </div>
          <div className="self-stretch text-center justify-start text-white text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-normal font-sans leading-relaxed">
            Sledge is AI-powered back office software built for construction
            teams. It automates operational work like document intake,
            approvals, and accounting workflows using autonomous AI — reducing
            manual work without changing how teams operate.
          </div>
        </div>
      </div>
    </div>
  );
}
