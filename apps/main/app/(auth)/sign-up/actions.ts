// app/(auth)/sign-up/actions.ts
"use server";

import { signUpSchema } from "@/lib/validators";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type SignUpFormState = {
  message: string;
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    phone?: string[];
    businessName?: string[];
    password?: string[];
    _form?: string[];
  };
  success: boolean;
  redirectTo?: string;
  requiresPayment?: boolean;
  userId?: number;
  timestamp?: number;
};

export async function signUpAction(
  prevState: SignUpFormState | null,
  formData: FormData
): Promise<SignUpFormState> {
  const timestamp = Date.now();

  const validatedFields = signUpSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: "Validation failed",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
      timestamp,
    };
  }

  const { firstName, lastName, email, phone, businessName, password } = validatedFields.data;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          businessName,
          password
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        message: data.message || "Registration failed",
        errors: { _form: [data.message || "Registration failed"] },
        success: false,
        timestamp,
      };
    }

    // Handle successful registration with automatic login
    if (data.token) {
      const cookieStore = await cookies();

      // Set the token in an HTTP-only cookie (same as login)
      cookieStore.set("token", data.token, {
        path: "/",
      });

      // Set user ID in a separate cookie for client-side access
      if (data.user?.id) {
        cookieStore.set("userId", String(data.user.id), {
          path: "/",
        });
      }

      // Redirect to onboarding - subscription provider will immediately handle payment setup
      redirect("/onboarding");
    }

    // Fallback error if the server response is successful but invalid
    return {
      message: "Invalid response from server",
      errors: { _form: ["Invalid response from server"] },
      success: false,
      timestamp,
    };

  } catch (error: any) {
    // Re-throw redirect errors (Next.js uses these for navigation)
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Sign-up error:", error);
    return {
      message: "Could not connect to the server. Please try again.",
      errors: { _form: ["An unexpected error occurred."] },
      success: false,
      timestamp,
    };
  }
}