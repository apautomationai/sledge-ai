import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// import middlewares
import passport from "@/lib/passport";

// import error handlers
import { errorHandler } from "@/helpers/error-handler";
import { notFoundHandler } from "@/helpers/not-found-handler";

// Route import
import healthRouter from "@/routes/health.route";
import usersRoutes from "@/routes/users.route";
import authRoutes from "@/routes/auth.routes";
import settingsRoutes from "@/routes/settings.route";
import uploadRoutes from "@/routes/upload.routes";
import invoiceRoutes from "@/routes/invoice.routes";
import quickbooksRoutes from "@/routes/quickbooks.routes";
import processorRoutes from "@/routes/processor.routes";
import subscriptionRoutes from "@/routes/subscription.routes";
import jobsRoutes from "@/routes/jobs.routes";
import reportRoutes from "@/routes/report.route"
import emailIntegrationRoutes from "./routes/email-integration.routes";

const app = express();

// Apply middleware
// Configure CORS to allow credentials
const getCorsOrigins = (): string | string[] => {
  const originsString = process.env.CORS_ORIGIN || 'http://localhost:3000';
  // Split by comma and trim whitespace
  const origins = originsString.split(',').map(origin => origin.trim());
  // If only one origin, return as string; otherwise return array
  return origins.length === 1 ? origins[0] : origins;
};

const corsOptions = {
  origin: getCorsOrigins(),
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Special handling for Stripe webhooks - must come before express.json()
app.use('/api/v1/subscription/webhook', express.raw({ type: 'application/json' }));

// Apply JSON parsing for all other routes
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Apply routes
app.get("/", (_req, res) => {
  res.json({ message: "Api is running", version: 0.1 });
});
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/email", emailIntegrationRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/invoice", invoiceRoutes);
app.use("/api/v1/quickbooks", quickbooksRoutes);
app.use("/api/v1/processor", processorRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/jobs", jobsRoutes);
app.use("/api/v1/report", reportRoutes);

// Apply error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
