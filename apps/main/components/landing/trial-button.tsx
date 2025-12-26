import Link from "next/link";

export function TrialButton() {
  return (
    <div
      data-state="Default"
      className="inline-flex justify-end items-center gap-4"
    >
      <Link href="/sign-up">
        <div className="px-4 py-3 bg-amber-400 rounded flex justify-start items-start gap-2 overflow-hidden">
          <div className="text-center justify-start text-stone-800 text-base font-bold font-['Inter'] uppercase leading-6">
            start a free trial
          </div>
        </div>
      </Link>
    </div>
  );
}
