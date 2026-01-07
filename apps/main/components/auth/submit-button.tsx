"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  label: string;
  pendingLabel: string;
  variant: "default" | "promo";
  isLoading?: boolean;
}

export function SubmitButton({
  label,
  pendingLabel,
  variant,
  isLoading,
}: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();

  // Use isLoading prop if provided, otherwise fall back to useFormStatus
  const pending = isLoading !== undefined ? isLoading : formPending;

  if (variant === "promo") {
    return (
      <button
        type="submit"
        disabled={pending}
        className="self-stretch px-4 py-3 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 rounded inline-flex justify-center items-center gap-2 overflow-hidden transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed"
      >
        {pending ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin h-5 w-5 text-stone-800" />
            <span className="text-stone-800 text-base font-bold font-['Inter'] uppercase leading-5">
              {pendingLabel}
            </span>
          </div>
        ) : (
          <div className="justify-start text-stone-800 text-base font-bold font-['Inter'] uppercase leading-5">
            {label}
          </div>
        )}
      </button>
    );
  }

  // Default variant (for sign-up and sign-in pages)
  return (
    <button
      className="flex-1 w-full px-4 py-3 flex justify-center items-center gap-2 overflow-hidden font-bold uppercase font-['Inter'] text-base leading-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: "#E3B02F",
        border: "none",
        borderRadius: "4px",
        color: "#292524",
      }}
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
          {pendingLabel}
        </div>
      ) : (
        <div className="justify-start">{label}</div>
      )}
    </button>
  );
}
