import { Features } from "./features";
import { PromoForm } from "./promo-form";

type FreeTrialProps = {
  code?: string;
};

export function FreeTrial({ code }: {code?: string}) {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 pb-12  md:pb-16">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Features */}
          <Features />

          {/* Right Column - Sign Up Form */}
          <PromoForm code={code} />
        </div>
      </div>
    </section>
  );
}
