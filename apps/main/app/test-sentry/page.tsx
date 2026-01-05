"use client";

import { Button } from "@workspace/ui/components/button";

export default function TestSentryPage() {
  const triggerError = () => {
    throw new Error("🧪 Test Error - Sentry should capture this and create a Jira ticket!");
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
            <li>Wait up to 24 hours for Jira ticket (or check immediately if you set interval to "immediately")</li>
            <li>Check Jira SLED project for new ticket</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
