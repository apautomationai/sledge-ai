import { Request, Response } from "express";
import { z } from "zod";
import { emailService } from "@/services/email.service";
import db from "@/lib/db";
import { contactMessagesModel } from "@/models/contact-messages.model";

const contactFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(1, { message: "Please select a subject." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(5000, { message: "Message must not exceed 5000 characters." }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

class ContactController {
  createContactMessage = async (req: Request, res: Response) => {
    try {
      // Validate request body using contactFormSchema
      const parseResult = contactFormSchema.safeParse(req.body);

      if (!parseResult.success) {
        const errors = parseResult.error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors
        });
      }

      const { firstName, lastName, email, subject, message }: ContactFormData = parseResult.data;

      // Store in database
      try {
        const [contactMessage] = await db
          .insert(contactMessagesModel)
          .values({
            firstName,
            lastName,
            email,
            subject: subject as "general" | "technical" | "billing" | "integrations" | "sales" | "security" | "feedback" | "other",
            message,
          })
          .returning();

        console.log("Contact message stored:", contactMessage.id);
      } catch (dbError: any) {
        console.error("Database error storing contact message:", dbError);
        // Continue to send email even if DB fails
        // This ensures user gets response and we get the email
      }

      // Send email to support (non-blocking for response)
      emailService.sendContactFormEmail({
        firstName,
        lastName,
        email,
        subject,
        message,
      }).catch((emailError) => {
        console.error("Failed to send contact form email:", emailError);
        // Log but don't fail the request
        // The message is already in the database
      });

      // Return success immediately
      return res.status(201).json({
        success: true,
        message: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });

    } catch (err: any) {
      console.error("Contact form submission error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to submit contact form. Please try again later.",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  };
}

export const contactController = new ContactController();
