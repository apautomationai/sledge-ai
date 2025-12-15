import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "@/lib/passport";

import { errorHandler } from "@/helpers/error-handler";
import { notFoundHandler } from "@/helpers/not-found-handler";

import healthRouter from "@/routes/health.route";
import usersRoutes from "@/routes/users.route";
import googleRoutes from "@/routes/google.routes";
import outlookRoutes from "@/routes/outlook.routes";
import authRoutes from "@/routes/auth.routes";
import settingsRoutes from "@/routes/settings.route";
import uploadRoutes from "@/routes/upload.routes";
import invoiceRoutes from "@/routes/invoice.routes";
import quickbooksRoutes from "@/routes/quickbooks.routes";
import processorRoutes from "@/routes/processor.routes";
import subscriptionRoutes from "@/routes/subscription.routes";
import jobsRoutes from "@/routes/jobs.routes";
import reportRoutes from "@/routes/report.route";

const app = express();
app.use(express.json());

// Configure CORS
const getCorsOrigins = (): string | string[] => {
  const originsString = process.env.CORS_ORIGIN || "http://localhost:3000";
  const origins = originsString.split(",").map((o) => o.trim());
  return origins.length === 1 ? origins[0] : origins;
};

app.use(cors({
  origin: getCorsOrigins(),
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Stripe webhooks require raw body
app.use("/api/v1/subscription/webhook", express.raw({ type: "application/json" }));

// Parse URL-encoded data and cookies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Health check
app.get("/", (_req, res) => res.json({ message: "Api is running", version: 0.1 }));

// Routes
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/google", googleRoutes);
app.use("/api/v1/outlook", outlookRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/invoice", invoiceRoutes);
app.use("/api/v1/quickbooks", quickbooksRoutes);
app.use("/api/v1/processor", processorRoutes); 
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/jobs", jobsRoutes);
app.use("/api/v1/report", reportRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
