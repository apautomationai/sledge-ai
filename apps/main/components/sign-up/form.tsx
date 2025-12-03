"use client";

import React, { useEffect, useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { AtSign, Lock, Loader2, User, Phone, Building2, Eye, EyeOff } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { signUpAction, SignUpFormState } from "@/app/(auth)/sign-up/actions";

const initialState: SignUpFormState = {
  message: "",
  success: false,
};

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <path
      fill="#FFC107"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#FF3D00"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1976D2"
      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.566,44,31.2,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
);

const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
    <path fill="#ff5722" d="M22 22H6V6h16v16z" />
    <path fill="#4caf50" d="M42 22H26V6h16v16z" />
    <path fill="#ffc107" d="M42 42H26V26h16v16z" />
    <path fill="#03a9f4" d="M22 42H6V26h16v16z" />
  </svg>
);

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-gray-900 font-bold py-3 px-4 rounded-none transition-all duration-300 shadow-lg shadow-yellow-500/50 hover:shadow-yellow-400/60 border-2 border-yellow-600 uppercase relative overflow-hidden group"
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <div className="flex items-center justify-center relative z-10">
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
          Creating Account...
        </div>
      ) : (
        <span className="relative z-10">Create an Account</span>
      )}
    </Button>
  );
}

function PasswordInput({
  id,
  name,
  placeholder,
  errors
}: {
  id: string;
  name: string;
  placeholder: string;
  errors?: string[];
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-gray-300 font-medium text-sm">
        Password<span className="text-red-400 ml-1">*</span>
      </Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-20" />
        <Input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          required
          className="pl-10 pr-10 h-11 bg-gray-800 border-4 border-gray-600 text-white placeholder-gray-400 rounded-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 transition-all duration-300 relative z-10"
        />
        <button
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors duration-200 z-20"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {errors && (
        <p className="text-sm text-red-400 mt-1">{errors[0]}</p>
      )}
    </div>
  );
}

export default function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, initialState);
  const router = useRouter();

  const handleGoogleSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/v1/auth/google`;
  };

  const handleMicrosoftSignIn = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/api/v1/auth/microsoft`;
  };

  useEffect(() => {
    // Only show error messages - success redirects are handled by server action
    if (state?.message && !state?.success) {
      toast.error("Sign Up Failed", {
        description: state.message,
      });
    }
  }, [state]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-none flex items-center justify-center shadow-[0_0_30px_rgba(253,176,34,0.5),inset_0_0_20px_rgba(0,0,0,0.5)] border-4 border-yellow-600/60 mx-auto mb-3 relative">
            <User className="h-8 w-8 text-gray-900 relative z-10" />
          </div>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase">
          Create an Account
        </h1>
        <p className="text-gray-300 text-sm text-balance">
          Get started with Sledge today
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="h-11 bg-gray-800 border-4 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-gray-200 rounded-none transition-all duration-300 relative overflow-hidden group uppercase"
          >
            <GoogleIcon className="mr-2 h-4 w-4 relative z-10" />
            <span className="relative z-10">Google</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleMicrosoftSignIn}
            className="h-11 bg-gray-800 border-4 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-gray-200 rounded-none transition-all duration-300 relative overflow-hidden group uppercase"
          >
            <MicrosoftIcon className="mr-2 h-4 w-4 relative z-10" />
            <span className="relative z-10">Microsoft</span>
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-600" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-br from-gray-900 to-black px-3 text-sm text-gray-400">
              Or sign up with email
            </span>
          </div>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="firstName" className="text-gray-300 font-medium text-sm">
                First Name<span className="text-red-400 ml-1">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-20" />
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  required
                  className="pl-10 h-11 bg-gray-800 border-4 border-gray-600 text-white placeholder-gray-400 rounded-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 transition-all duration-300 relative z-10"
                />
              </div>
              {state.errors?.firstName && (
                <p className="text-sm text-red-400 mt-1">{state.errors.firstName[0]}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="lastName" className="text-gray-300 font-medium text-sm">
                Last Name<span className="text-red-400 ml-1">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-20" />
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  required
                  className="pl-10 h-11 bg-gray-800 border-4 border-gray-600 text-white placeholder-gray-400 rounded-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 transition-all duration-300 relative z-10"
                />
              </div>
              {state.errors?.lastName && (
                <p className="text-sm text-red-400 mt-1">{state.errors.lastName[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="phone" className="text-gray-300 font-medium text-sm">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-20" />
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1234567890"
                  className="pl-10 h-11 bg-gray-800 border-4 border-gray-600 text-white placeholder-gray-400 rounded-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 transition-all duration-300 relative z-10"
                />
              </div>
              {state.errors?.phone && (
                <p className="text-sm text-red-400 mt-1">{state.errors.phone[0]}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="businessName" className="text-gray-300 font-medium text-sm">
                Business Name<span className="text-red-400 ml-1">*</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-20" />
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder="Business Name"
                  required
                  className="pl-10 h-11 bg-gray-800 border-4 border-gray-600 text-white placeholder-gray-400 rounded-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 transition-all duration-300 relative z-10"
                />
              </div>
              {state.errors?.businessName && (
                <p className="text-sm text-red-400 mt-1">{state.errors.businessName[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="text-gray-300 font-medium text-sm">
              Email Address<span className="text-red-400 ml-1">*</span>
            </Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 z-20" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="pl-10 h-11 bg-gray-800 border-4 border-gray-600 text-white placeholder-gray-400 rounded-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-600 transition-all duration-300 relative z-10"
              />
            </div>
            {state.errors?.email && (
              <p className="text-sm text-red-400 mt-1">{state.errors.email[0]}</p>
            )}
          </div>

          <PasswordInput
            id="password"
            name="password"
            placeholder="6+ characters"
            errors={state.errors?.password}
          />

          {state.errors?._form && (
            <div className="p-3 bg-red-900/20 border-4 border-red-800 rounded-none relative overflow-hidden">
              <p className="text-sm text-red-400 text-center relative z-10">{state.errors._form[0]}</p>
            </div>
          )}

          <SubmitButton />
        </form>

        <div className="text-sm text-gray-400 text-center pt-4 border-t-2 border-gray-600">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-yellow-400 hover:text-yellow-300 transition-colors duration-300 underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}