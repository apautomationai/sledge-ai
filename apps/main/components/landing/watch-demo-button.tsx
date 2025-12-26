import Link from "next/link";

export function WatchDemoButton() {
  return (
    <Link href="#demo">
      <div className="px-4 py-3 bg-zinc-800 rounded inline-flex justify-start items-start gap-2 overflow-hidden hover:bg-zinc-700 transition-colors duration-300">
        <div className="text-center justify-start text-zinc-100 text-base font-bold font-['Inter'] uppercase leading-6">
          WATCH HOW IT WORKS
        </div>
      </div>
    </Link>
  );
}
