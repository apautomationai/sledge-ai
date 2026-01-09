import { z } from "zod";


export const signUpSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required." }),
  lastName: z.string().min(2, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z.string().max(20, { message: "Please enter a valid phone number." }),
  businessName: z.string().min(2, { message: "Business name is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  promoCode: z.string().optional(),
});

// For Sign In
export const SignInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

// For Reset Password
export const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters." }),
  resetToken: z.string().min(1, { message: "Token is required." }),
});

// For Forgot Password
export const ForgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

// --- Forgot Password ---
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const personalInfoSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  // Email is fetched from server and should not be editable by the user
  email: z.string().email(), 
  phone: z.string().min(6, { message: "Please enter a valid phone number." }).optional().or(z.literal('')),
  businessName: z.string().min(2, { message: "Business name is required." }).optional().or(z.literal('')),

  
  // For displaying the current avatar from the server
  avatarUrl: z.string().optional(),
  
  // For validating a new avatar file upload from the client
  avatarFile: z
    .any()
    .refine((files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    )
    .optional(),
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters long." }),
  confirmPassword: z.string(),
})
.refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"], // Show the error on the confirmation field
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;



// Add this new schema for the attachment details form
export const attachmentDetailsSchema = z.object({
  filename: z.string().min(1, "Filename is required."),
  sender: z.string().email("Invalid email format."),
  receiver: z.string().email("Invalid email format."),
});

export type AttachmentDetailsFormData = z.infer<typeof attachmentDetailsSchema>;

// Bug Report Schema
const MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];

// Debug info schema for bug reports
const debugInfoSchema = z.object({
  logs: z.array(z.object({
    timestamp: z.string(),
    level: z.enum(["log", "warn", "error", "info"]),
    message: z.string(),
  })),
  networkErrors: z.array(z.object({
    timestamp: z.string(),
    method: z.string(),
    url: z.string(),
    status: z.number().nullable(),
    statusText: z.string(),
    error: z.string(),
  })),
  browserContext: z.object({
    url: z.string(),
    userAgent: z.string(),
    platform: z.string(),
    language: z.string(),
    screenSize: z.string(),
    viewportSize: z.string(),
    timestamp: z.string(),
  }),
});

export const bugReportSchema = z.object({
  category: z.string().min(1, { message: "Please select a category." }),
  title: z.string().min(1, { message: "Bug title is required." }).max(200, { message: "Title must be less than 200 characters." }),
  description: z.string().min(1, { message: "Bug description is required." }).max(5000, { message: "Description must be less than 5000 characters." }),
  priority: z.enum(["low", "medium", "high", "critical"], { message: "Please select a priority level." }),
  attachment: z
    .any()
    .refine(
      (file) => !file || file.size <= MAX_ATTACHMENT_SIZE,
      "Max file size is 50MB."
    )
    .refine(
      (file) => !file || ACCEPTED_ATTACHMENT_TYPES.includes(file.type),
      "Only images (JPEG, PNG, GIF, WebP), PDF, and video files (MP4, WebM) are supported."
    )
    .optional(),
  debugInfo: debugInfoSchema.optional(),
});

export type BugReportFormData = z.infer<typeof bugReportSchema>;
export type DebugInfo = z.infer<typeof debugInfoSchema>;
export const contactFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(1, { message: "Please select a subject." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(5000, { message: "Message must not exceed 5000 characters." }),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
