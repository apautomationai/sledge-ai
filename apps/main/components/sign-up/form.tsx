"use client";

import React, { useEffect, useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { signUpAction, SignUpFormState } from "@/app/(auth)/sign-up/actions";

const initialState: SignUpFormState = {
  message: "",
  success: false,
};

const GoogleIcon = () => (
  <img src="/images/Type=Google.svg" alt="Google" className="w-5 h-5" />
);

const MicrosoftIcon = () => (
  <img src="/images/Type=Microsoft.svg" alt="Microsoft" className="w-5 h-5" />
);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      className="flex-1 w-full px-4 py-3 flex justify-center items-center gap-2 overflow-hidden font-bold uppercase font-['Inter'] text-base leading-6 cursor-pointer"
      style={{ background: '#E3B02F', border: 'none', borderRadius: '4px', color: '#292524' }}
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center justify-center">
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
          Creating Account...
        </div>
      ) : (
        <div className="justify-start">SIGN UP</div>
      )}
    </Button>
  );
}

function PasswordInput({
  id,
  name,
  placeholder,
  errors,
  value,
  onChange
}: {
  id: string;
  name: string;
  placeholder: string;
  errors?: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="self-stretch flex flex-col justify-start items-end gap-1">
      <div className="self-stretch flex flex-col justify-start items-start gap-1">
        <Label htmlFor={id} className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
          Password<span className="text-red-400 ml-1 md:inline hidden">*</span>
        </Label>
        <div className="relative w-full">
          <Input
            id={id}
            name={name}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            required
            minLength={6}
            value={value}
            onChange={onChange}
            className="self-stretch h-11 pr-10 text-sm font-medium focus:ring-0 px-4 py-2 bg-zinc-900 rounded border border-neutral-500 text-stone-50 focus:border-amber-400 focus:outline-none transition-colors"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:text-gray-400 text-gray-400 z-20 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors && (
          <p className="text-sm text-red-400 mt-1">{errors[0]}</p>
        )}
      </div>
      <div className="self-stretch justify-start text-zinc-400 text-xs font-normal font-['Inter'] leading-4 md:hidden">At least 6 characters</div>
    </div>
  );
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    businessName: "",
    email: "",
    password: "",
  });

  const handleGoogleSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/v1/auth/google`;
  };

  const handleMicrosoftSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/v1/auth/microsoft`;
  };

  useEffect(() => {
    // Handle success - trigger browser refresh
    if (state?.success && state?.redirectTo) {
      toast.success("Account Created", {
        description: "Welcome! Redirecting to onboarding...",
      });
      // Use setTimeout to allow toast to show before refresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return;
    }

    // Show error messages
    if (state?.message && !state?.success) {
      toast.error("Sign Up Failed", {
        description: state.message,
      });
    }
  }, [state]);

  return (
    <div className="w-full flex flex-col justify-center items-center gap-5">
      {/* Logo - Centered */}
      <Link href="/" className="w-48 h-16 relative cursor-pointer">
        <img
          src="/images/logos/logosledge.png"
          alt="Logo"
          className="w-16 h-16 absolute left-0 top-0 rounded-2xl"
        />
        <div className="absolute left-[74.67px] top-[17.33px] justify-center text-white text-3xl font-bold font-['League_Spartan'] capitalize leading-8">
          SLEDGE
        </div>
      </Link>

      {/* Header */}
      <div className="self-stretch text-center justify-start text-gray-200 text-xl font-bold font-['Inter'] leading-7">
        Create a Sledge Account
      </div>

      <div className="w-full flex flex-col gap-5">
        {/* Social Login Buttons */}
        <div className="self-stretch flex flex-col gap-3">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="self-stretch h-11 px-4 py-2 inline-flex justify-center items-center gap-3 relative overflow-hidden hover:text-gray-200 font-medium font-['Inter'] text-base leading-6 cursor-pointer"
            style={{ background: '#18181B', border: '1px solid #808080', borderRadius: '4px', color: '#E5E5E5' }}
          >
            <GoogleIcon />
            <span className="justify-start">Sign up with Google</span>
          </Button>
          <Button
            type="button"
            onClick={handleMicrosoftSignIn}
            className="self-stretch h-11 px-4 py-2 inline-flex justify-center items-center gap-3 relative overflow-hidden hover:text-gray-200 font-medium font-['Inter'] text-base leading-6 cursor-pointer"
            style={{ background: '#18181B', border: '1px solid #808080', borderRadius: '4px', color: '#E5E5E5' }}
          >
            <MicrosoftIcon />
            <span className="justify-start">Sign up with Microsoft</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="self-stretch inline-flex justify-start items-center gap-1.5">
          <div className="flex-1 h-px bg-neutral-600" />
          <div className="text-center justify-start text-zinc-400 text-sm font-normal font-['Inter'] leading-5">
            OR
          </div>
          <div className="flex-1 h-px bg-neutral-600" />
        </div>

        {/* Sign Up Form */}
        <form action={formAction} className="self-stretch flex flex-col justify-start items-center gap-6">
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <Label htmlFor="firstName" className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
                  First name<span className="text-red-400 ml-1 md:inline hidden">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-zinc-900 rounded border border-neutral-500 text-stone-50 focus:border-amber-400 focus:outline-none transition-colors"
                />
                {state.errors?.firstName && (
                  <p className="text-sm text-red-400 mt-1">{state.errors.firstName[0]}</p>
                )}
              </div>

              <div className="self-stretch flex flex-col justify-start items-start gap-1">
                <Label htmlFor="lastName" className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
                  Last name<span className="text-red-400 ml-1 md:inline hidden">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-zinc-900 rounded border border-neutral-500 text-stone-50 focus:border-amber-400 focus:outline-none transition-colors"
                />
                {state.errors?.lastName && (
                  <p className="text-sm text-red-400 mt-1">{state.errors.lastName[0]}</p>
                )}
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <Label htmlFor="phone" className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-zinc-900 rounded border border-neutral-500 text-stone-50 focus:border-amber-400 focus:outline-none transition-colors"
              />
              {state.errors?.phone && (
                <p className="text-sm text-red-400 mt-1">{state.errors.phone[0]}</p>
              )}
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <Label htmlFor="businessName" className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
                Business Name<span className="text-red-400 ml-1">*</span>
              </Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Business Name"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-zinc-900 rounded border border-neutral-500 text-stone-50 focus:border-amber-400 focus:outline-none transition-colors"
              />
              {state.errors?.businessName && (
                <p className="text-sm text-red-400 mt-1">{state.errors.businessName[0]}</p>
              )}
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <Label htmlFor="email" className="self-stretch justify-start text-white text-sm font-medium font-['Inter']">
                Email address<span className="text-red-400 ml-1 md:inline hidden">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="self-stretch h-11 text-sm font-medium focus:ring-0 px-4 py-2 bg-zinc-900 rounded border border-neutral-500 text-stone-50 focus:border-amber-400 focus:outline-none transition-colors"
              />
              {state.errors?.email && (
                <p className="text-sm text-red-400 mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            <PasswordInput
              id="password"
              name="password"
              placeholder="6+ characters"
              errors={state.errors?.password}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          {state.errors?._form && (
            <div className="p-3 bg-red-900/20 relative overflow-hidden" style={{ border: '1px solid #808080', borderRadius: '4px' }}>
              <p className="text-sm text-red-400 text-center relative z-10">{state.errors._form[0]}</p>
            </div>
          )}

          <div className="self-stretch inline-flex justify-end items-center gap-4">
            <SubmitButton />
          </div>
        </form>

        <div className="inline-flex justify-center items-center gap-1 flex-wrap">
          <div className="justify-center text-white text-sm md:text-base font-bold font-['Inter'] leading-6 whitespace-nowrap">
            ALREADY HAVE AN ACCOUNT?
          </div>
          <Link
            href="/sign-in"
            className="justify-start text-sm md:text-base font-bold font-['Inter'] uppercase leading-6 hover:text-amber-400 whitespace-nowrap"
            style={{ color: '#E3B02F' }}
          >
            LOG IN
          </Link>
        </div>
      </div>
    </div>
  );
}
