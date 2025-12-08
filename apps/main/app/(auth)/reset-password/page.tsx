import React, { Suspense } from "react";
import ResetPasswordForm from "@/components/reset-password/form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-white">Loading form...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
