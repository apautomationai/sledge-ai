import Link from "next/link";
import Image from "next/image";

export function PromoHeader() {
  return (
    <header className="w-full bg-[#141414] backdrop-blur-none shadow-[0_4px_20px_rgba(0,0,0,0.9),0_0_30px_rgba(253,176,34,0.2)] border-yellow-600/50 relative z-[9999]">
      <nav className="w-full px-4 md:px-12" aria-label="Global">
        <div className="relative flex items-center justify-between py-3 md:py-[13px]">
          <Link href="/" className="flex items-center gap-3 z-10">
            <div className="w-full h-full rounded-xl flex items-center justify-center">
              <Image
                src={"/images/logos/logosledge.png"}
                alt="Logo"
                width={48}
                height={48}
              />
            </div>
            <span className="uppercase text-white text-2xl font-bold font-['League_Spartan'] leading-6">
              SLEDGE
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
