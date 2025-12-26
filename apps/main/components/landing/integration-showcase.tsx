export default function IntegrationShowcase() {
  return (
    <div className=" px-52 py-8 inline-flex flex-col justify-start items-center gap-6 overflow-hidden ">
      <div className="flex flex-col justify-start items-center gap-2">
        <div className="text-center justify-start text-white text-2xl font-bold font-['League_Spartan'] uppercase">
          Sledge connects directly with the tools construction teams already
          use.
        </div>
        <div className="text-center justify-start text-white text-lg font-normal font-['Inter'] leading-6">
          Email, accounting, and payments — unified through AI-powered
          workflows.
        </div>
      </div>
      <div className="inline-flex justify-start items-center gap-16">
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
