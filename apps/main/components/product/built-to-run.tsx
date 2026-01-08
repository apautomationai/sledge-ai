import Link from "next/link";

interface BuiltToRunProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
}

export function BuiltToRun({
  title,
  subtitle,
  description,
  primaryButtonText = "start a free trial",
  primaryButtonHref = "/sign-up",
  secondaryButtonText = "WATCH HOW IT WORKS",
  secondaryButtonHref = "#demo",
}: BuiltToRunProps) {
  return (
    <section className="w-full px-6 md:px-8 lg:px-12 py-12 md:py-16">
      <div className="max-w-[1400px] mx-auto text-center">
        {title && (
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan']">
            {title}
          </h2>
        )}
        {subtitle && (
          <h3 className="text-3xl lg:text-5xl font-bold tracking-tight text-white uppercase font-['League_Spartan']">
            {subtitle}
          </h3>
        )}
        {description && (
          <p className="mt-2 text-lg md:text-2xl text-white mb-8">
            {description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={primaryButtonHref} className="w-full sm:w-auto">
            <div className="px-4 py-3 bg-[#e3b02f] rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors duration-300">
              <div className="text-center text-stone-800 text-sm sm:text-base font-bold font-['Inter'] uppercase leading-6">
                {primaryButtonText}
              </div>
            </div>
          </Link>
          <Link href={secondaryButtonHref} className="w-full sm:w-auto">
            <div className="px-4 py-3 bg-zinc-800 rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-zinc-700 transition-colors duration-300">
              <div className="text-center text-zinc-100 text-sm sm:text-base font-bold font-['Inter'] uppercase leading-6">
                {secondaryButtonText}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
