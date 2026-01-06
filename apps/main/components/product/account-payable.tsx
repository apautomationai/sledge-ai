import Link from "next/link";

export function AiAccount() {
  return (
    <section className="relative flex items-center justify-center py-12 md:py-16 px-6 md:px-8 lg:px-12">
      <div className="relative mx-auto max-w-[1400px] w-full">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-['League_Spartan'] tracking-tight text-white uppercase">
            AI Accounts payable. done for you.
          </h2>

          <p className="mt-2 md:mt-2 text-lg lg:text-2xl text-white">
            Sledge uses autonomous AI to capture invoices from email, parse and
            validate invoice data, route for human approval, and automatically
            sync approved bills into QuickBooks.
          </p>

          <div className="mt-2 md:mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/sign-up" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-[#E3B02F] rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors duration-300">
                <div className="text-center text-stone-800 text-base font-bold font-['Inter'] uppercase leading-6">
                  start a free trial
                </div>
              </div>
            </Link>

            <Link href="#demo" className="w-full sm:w-auto">
              <div className="px-4 py-3 bg-zinc-800 rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-zinc-700 transition-colors duration-300">
                <div className="text-center text-zinc-100 text-base font-bold font-['Inter'] uppercase leading-6">
                  WATCH HOW IT WORKS
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
