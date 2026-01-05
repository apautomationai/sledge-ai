"use client";

import { Button } from "@workspace/ui/components/button";
import { notFound } from "next/navigation";

export default function TestSentryPage() {
  if (process.env.NEXT_PUBLIC_DEVELOPMENT !== "true") {
    notFound();
  }
  const triggerError = () => {
    throw new Error("Sentry should capture this new error we have!");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">Test Sentry Integration</h1>
        <p className="mb-6 text-muted-foreground">
          Click the button to trigger a test error
        </p>
        <Button onClick={triggerError} variant="destructive" size="lg">
          Trigger Test Error
        </Button>
        <div className="mt-8 text-sm text-muted-foreground">
          <p>After clicking:</p>
          <ol className="mt-2 list-inside list-decimal text-left">
            <li>Check Sentry dashboard for the error</li>
            <li>
              Wait up to 3 hours for Jira ticket (or check immediately if you
              set interval to "immediately")
            </li>
            <li>Check Jira SLED project for new ticket</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
