import Link from "next/link";

export function AiAccount() {
  return (
    <section className="relative flex items-center justify-center pt-12 pb-12 md:pb-16 px-6 md:px-8">
      <div className="relative mx-auto max-w-[1381px] w-full flex flex-col gap-12 items-center">
        <div className="flex flex-col gap-6 items-center text-center w-full">
          <h1 className="text-4xl md:text-5xl lg:text-[64px] font-bold tracking-tight text-white uppercase font-['League_Spartan'] leading-normal">
            AI Accounts payable. done for you.
          </h1>

          <p className="text-lg lg:text-2xl text-white leading-normal">
            Sledge uses autonomous AI to capture invoices from email, parse and
            validate invoice data, route for human approval, and automatically
            sync approved bills into QuickBooks.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-[18px]">
          <Link href="/sign-up" className="w-full sm:w-auto">
            <div className="px-4 py-3 bg-[#E3B02F] rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-amber-500 transition-colors duration-300">
              <div className="text-center text-[#312c27] text-base font-bold font-['Inter'] uppercase leading-6">
                start a free trial
              </div>
            </div>
          </Link>

          <Link href="#demo" className="w-full sm:w-auto">
            <div className="px-4 py-3 bg-[#2e2e2e] rounded flex justify-center items-center gap-2 overflow-hidden hover:bg-zinc-700 transition-colors duration-300">
              <div className="text-center text-[#efefef] text-base font-bold font-['Inter'] uppercase leading-6">
                WATCH HOW IT WORKS
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
