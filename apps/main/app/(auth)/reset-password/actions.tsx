"use server";

import { resetPasswordSchema } from "@/lib/validators";

export type ResetPasswordFormState = {
  message: string;
  data?: {
    user: {
      id: number;
      firstName: string;
      lastName: string;
      avatar: string;
      email: string;
      phone: string;
    };
    token: string;
  };
  errors?: {
    password?: string[];
    confirmPassword?: string[];
    resetToken?: string[];
    _form?: string[];
  };
  success: boolean;
  timestamp?: number;
};

export async function resetPasswordAction(
  prevState: ResetPasswordFormState,
  formData: FormData
): Promise<ResetPasswordFormState> {
  const validatedFields = resetPasswordSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { password, confirmPassword, resetToken } = validatedFields.data;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/reset-password`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ password, confirmPassword, resetToken }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = 
        errorData.message || 
        errorData.error?.message || 
        "Failed to reset password. Please try again.";
      return {
        message: errorMessage,
        errors: { _form: [errorMessage] },
        success: false,
      };
    }

    const data = await response.json();

    if (!data.success) {
      return {
        message: data.message,
        errors: { _form: [data.message] },
        success: false,
      };
    }

    return {
      message: data.message,
      success: true,
      data: data,
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      message: "An unexpected error occurred. Please try again.",
      errors: { _form: ["An unexpected error occurred."] },
      success: false,
    };
  }
}