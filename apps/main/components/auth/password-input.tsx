"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant: "default" | "promo" | "signin";
  errors?: string[];
  placeholder?: string;
  showHint?: boolean;
  showLabel?: boolean;
  label?: string;
  required?: boolean;
}

export function PasswordInput({
  id,
  name,
  errors,
  value,
  onChange,
  placeholder,
  showHint,
  showLabel,
  label,
  required,
  variant,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  if (variant === "promo") {
    return (
      <div className="self-stretch flex flex-col justify-center items-start gap-1">
        <div className="self-stretch flex flex-col justify-start items-start gap-1">
          {showLabel && (
            <label
              htmlFor={id}
              className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
            >
              {label}
            </label>
          )}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              id={id}
              name={name}
              minLength={6}
              value={value}
              onChange={onChange}
              className="self-stretch w-full h-11 px-4 py-2 pr-10 bg-zinc-800 rounded outline outline-1 outline-offset-[-1px] outline-neutral-400 text-neutral-100 text-sm font-medium focus:outline-amber-400 transition-colors"
              required={required}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors && <p className="text-sm text-red-400 mt-1">{errors[0]}</p>}
        </div>
        {showHint && (
          <div className="justify-start text-white text-sm font-normal font-['Inter'] leading-5">
            At least 6 characters
          </div>
        )}
      </div>
    );
  }

  if (variant === "signin") {
    return (
      <div className="self-stretch flex flex-col gap-1">
        {showLabel && (
          <label
            htmlFor={id}
            className="self-stretch text-white text-sm font-medium font-['Inter']"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={id}
            name={name}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="self-stretch w-full h-11 pr-10 text-sm font-medium focus:ring-0 px-4 py-2 bg-zinc-900 rounded border border-neutral-500 text-stone-50 focus:border-amber-400 focus:outline-none transition-colors"
            required={required}
            minLength={6}
          />
          <button
            type="button"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:text-gray-400 text-gray-400 z-20 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors && <p className="text-sm text-red-400 mt-1">{errors[0]}</p>}
      </div>
    );
  }

  // Default variant (for sign-up page)
  return (
    <div className="self-stretch flex flex-col justify-start items-end gap-1">
      <div className="self-stretch flex flex-col justify-start items-start gap-1">
        {showLabel && (
          <label
            htmlFor={id}
            className="self-stretch justify-start text-white text-sm font-medium font-['Inter']"
          >
            {label}
            <span className="text-red-400 ml-1 md:inline hidden">*</span>
          </label>
        )}
        <div className="relative w-full">
          <input
            id={id}
            name={name}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            required={required}
            minLength={6}
            value={value}
            onChange={onChange}
            className="self-stretch w-full h-11 pr-10 text-sm font-medium focus:ring-0 px-4 py-2 bg-zinc-900 rounded border border-neutral-500 text-stone-50 focus:border-amber-400 focus:outline-none transition-colors"
          />
          <button
            type="button"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:text-gray-400 text-gray-400 z-20 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors && <p className="text-sm text-red-400 mt-1">{errors[0]}</p>}
      </div>
      {showHint && (
        <div className="self-stretch justify-start text-zinc-400 text-xs font-normal font-['Inter'] leading-4 md:hidden">
          At least 6 characters
        </div>
      )}
    </div>
  );
}
