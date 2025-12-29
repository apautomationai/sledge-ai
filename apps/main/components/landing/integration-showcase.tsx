export default function IntegrationShowcase() {
  return (
    <div className="w-full px-4 sm:px-8 md:px-16 lg:px-52 py-8 flex flex-col justify-center items-center gap-6 overflow-hidden">
      <div className="flex flex-col justify-center items-center gap-2">
        <div className="text-center text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-league-spartan uppercase leading-tight sm:leading-tight md:leading-snug">
          Sledge connects directly with the tools construction teams already
          use.
        </div>
        <div className="text-center text-white text-sm sm:text-base md:text-lg lg:text-xl font-normal font-sans leading-relaxed sm:leading-relaxed md:leading-6">
          Email, accounting, and payments — unified through AI-powered
          workflows.
        </div>
      </div>
      <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap">
        <img
          className="h-12 object-contain"
          src="/images/Stripe wordmark - White 1.png"
          alt="Stripe"
        />

        <img
          className="h-12 object-contain"
          src="/images/128px-Gmail_icon_(2020).svg 1.png"
          alt="Gmail"
        />
        <img
          className="h-12 object-contain"
          src="/images/1024px-Microsoft_Outlook_logo_(2024–2025).svg 1.png"
          alt="Microsoft Outlook"
        />
        <img
          className="h-12 object-contain"
          src="/images/quickbooks-brand-preferred-logo-50-50-white-external 1.png"
          alt="QuickBooks"
        />
      </div>
    </div>
  );
}
