// instrumentation.ts
// This file must run BEFORE Express is imported

// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",

  // Required for HTTP & Express tracing
  tracesSampleRate: 0.1,

  // Optional but recommended
  profilesSampleRate: 1.0,

  integrations: [
    // Required for HTTP tracing (Node 20+ safe)
    Sentry.httpIntegration(),
    // Required for Express instrumentation
    Sentry.expressIntegration(),
  ],
});
