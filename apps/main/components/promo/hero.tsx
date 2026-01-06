import Link from "next/link";
import Image from "next/image";

export function PromoHero() {
  return (
    <section className="relative flex items-center justify-center w-full h-[338px] md:py-16 md:h-auto bg-[url('/images/promo.png')] bg-cover bg-center bg-no-repeat md:bg-none">
      {/* Background Image Overlay - Only on mobile */}
      <div className="absolute inset-0 w-full h-full bg-black/60 md:hidden" />

      <div className="relative mx-auto max-w-[1400px] w-full px-6 md:px-8 lg:px-12 pt-[174px] md:pt-0">
        <div className="mx-auto max-w-4xl text-center flex flex-col items-center md:justify-center h-full">
          <div className="w-full">
            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold font-['League_Spartan'] tracking-tight text-white uppercase">
              SLEDGE YOUR INVOICES.
            </h2>

            <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold font-['League_Spartan'] tracking-tight text-white md:text-[#E3B02F] uppercase md:mt-0">
              GET YOUR TIME BACK.
            </h2>

            <div className="mt-2 md:mt-6 flex items-center justify-center  md:pb-0">
              <Link href="/sign-up">
                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-[#E3B02F] rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors duration-300">
                  <div className="text-center text-stone-800 text-sm sm:text-base font-bold font-['Inter'] uppercase leading-6">
                    REDEEM FREE TRIAL
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-8 md:mt-12 items-center justify-center hidden md:flex">
            <Image
              src="/images/promo.png"
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
