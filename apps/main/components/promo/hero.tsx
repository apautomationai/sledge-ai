import Link from "next/link";
import Image from "next/image";

export function PromoHero() {
  return (
    <section className="relative flex items-center justify-center py-12 md:py-16 px-6 md:px-8 lg:px-12">
      <div className="relative mx-auto max-w-[1400px] w-full">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['League_Spartan'] tracking-tight text-white uppercase">
            SLEDGE YOUR INVOICES.
          </h2>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['League_Spartan'] tracking-tight text-[#E3B02F] uppercase">
            GET YOUR TIME BACK.
          </h2>

          <div className="mt-2 md:mt-6 flex items-center justify-center">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-[#E3B02F] rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors duration-300">
                <div className="text-center text-stone-800 text-base font-bold font-['Inter'] uppercase leading-6">
                  REDEEM FREE TRIAL
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-8 md:mt-12 flex items-center justify-center">
            <Image
              src="/images/sign-up-test-1 2.png"
              alt="Sledge Demo"
              width={913}
              height={546}
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
