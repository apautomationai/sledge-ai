import { Check } from "lucide-react";

const features = [
  "Unlimited AI invoice processing",
  "AI email listener + file ingestion",
  "Automatic invoices & vendor assignment",
  "Gmail & Outlook integration",
  "No per-invoice fees. No usage caps.",
];

export function Features() {
  return (
    <div className="text-white">
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-['League_Spartan'] tracking-tight uppercase mb-4">
        Start your free trial in under a minute.
      </h2>
      <p className="text-base md:text-lg mb-6">
        Connect your inbox, let Sledge extract invoices, and push bills to
        QuickBooks automatically.
      </p>

      <div className="">
        <div className="p-2 bg-amber-400/10 rounded inline-flex justify-center items-center gap-2 mb-6">
          <p className="text-sm md:text-base font-semibold">
            with Sledge Core you get:
          </p>
        </div>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#E3B02F] shrink-0 mt-0.5" />
              <span className="text-sm md:text-base">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
