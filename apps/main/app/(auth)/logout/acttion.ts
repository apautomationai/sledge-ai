"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();

  // Remove the authentication cookies
  cookieStore.delete('token');
  cookieStore.delete('userId');

  // Redirect to home page
  redirect("/sign-in");
}