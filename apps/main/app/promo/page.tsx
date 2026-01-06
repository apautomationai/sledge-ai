import { FreeTrial } from "@/components/promo/free-trial";
import { PromoHeader } from "@/components/promo/header";
import { PromoHero } from "@/components/promo/hero";

export default function AiAccountPayable() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <PromoHeader />
      <main className="flex flex-col w-full">
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
        <div className="relative">
          <PromoHero />
          <FreeTrial />
        </div>
      </main>
    </div>
  );
}
