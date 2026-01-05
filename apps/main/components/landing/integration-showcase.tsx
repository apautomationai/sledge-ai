export default function IntegrationShowcase() {
  return (
    <div className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center">
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white uppercase font-['League_Spartan']">
            Sledge connects directly with the tools construction teams already
            use.
          </h2>
          <p className="mt-2 text-base md:text-lg text-white">
            Email, accounting, and payments — unified through AI-powered
            workflows.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center items-center gap-3 md:gap-16">
          <img
            className="w-16 h-6 md:w-36 md:h-12 object-contain"
            src="/images/Stripe wordmark - White 1.png"
            alt="Stripe"
          />
          <img
            className="w-8 h-6 md:w-16 md:h-12 object-contain"
            src="/images/128px-Gmail_icon_(2020).svg 1.png"
            alt="Gmail"
          />
          <img
            className="w-8 h-6 md:w-16 md:h-12 object-contain"
            src="/images/1024px-Microsoft_Outlook_logo_(2024–2025).svg 1.png"
            alt="Microsoft Outlook"
          />
          <img
            className="w-20 h-6 md:w-48 md:h-12 object-contain"
            src="/images/quickbooks-brand-preferred-logo-50-50-white-external 1.png"
            alt="QuickBooks"
          />
        </div>
      </div>
    </div>
  );
}
