import nodemailer from "nodemailer";

interface EmailParams {
    to: string | string[];
    subject: string;
    htmlBody?: string;
    textBody?: string;
    from?: string;
}

// temporary using nodemailer to send email
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export class EmailService {
    private defaultFrom = process.env.AUTH_EMAIL || "";
    private notificationFrom = process.env.NOTIFICATION_EMAIL || "";

    // send email
    sendEmail = async ({ to, subject, htmlBody, textBody, from }: EmailParams) => {
        try {
            const info = await transporter.sendMail({
                from: from || this.defaultFrom,
                to: Array.isArray(to) ? to : [to],
                subject,
                html: htmlBody,
                text: textBody,
            });

            return info;
        } catch (err) {
            console.error("Error sending email:", err);
            throw new Error("Failed to send email");
        }
    };

    // send password reset email
    sendPasswordResetEmail = async (to: string, resetLink: string) => {
        const subject = "Reset Your Password";
        const htmlBody = `
            <p>Hello,</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}" target="_blank">${resetLink}</a>
            <p>If you did not request this, please ignore this email.</p>
        `;
        const textBody = `Hello,\n\nCopy and paste this link to reset your password: ${resetLink}`;

        return this.sendEmail({ to, subject, htmlBody, textBody });
    };

    // send invoice rejection email
    sendInvoiceRejectionEmail = async (params: {
        to: string;
        invoiceNumber: string;
        vendorName?: string;
        rejectionReason?: string;
        companyName?: string;
    }) => {
        const { to, invoiceNumber, vendorName, rejectionReason, companyName = "Sledge" } = params;
        const from = this.notificationFrom;
        const subject = `Invoice ${invoiceNumber} Has Been Rejected`;

        const htmlBody = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #f8f9fa; padding: 20px; border-radius: 8px 8px 0 0; }
                    .content { background-color: #ffffff; padding: 20px; border: 1px solid #e9ecef; }
                    .footer { background-color: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6c757d; }
                    .invoice-number { font-weight: bold; color: #dc3545; }
                    .reason-box { background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin: 0; color: #dc3545;">Invoice Rejected</h2>
                    </div>
                    <div class="content">
                        <p>Hello${vendorName ? ` ${vendorName}` : ''},</p>

                        <p>We are writing to inform you that invoice <span class="invoice-number">${invoiceNumber}</span> has been rejected.</p>

                        ${rejectionReason ? `
                        <div class="reason-box">
                            <strong>Reason for rejection:</strong>
                            <p style="margin: 5px 0 0 0;">${rejectionReason}</p>
                        </div>
                        ` : ''}

                        <p>Please review the invoice and resubmit with the necessary corrections. If you have any questions or need clarification, please don't hesitate to reach out.</p>

                        <p>Thank you for your understanding.</p>

                        <p>Best regards,<br>${companyName} Team</p>
                    </div>
                    <div class="footer">
                        <p style="margin: 0;">This is an automated message from ${companyName}. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const textBody = `Hello${vendorName ? ` ${vendorName}` : ''},

        We are writing to inform you that invoice ${invoiceNumber} has been rejected.

        ${rejectionReason ? `Reason for rejection: ${rejectionReason}\n` : ''}
        Please review the invoice and resubmit with the necessary corrections. If you have any questions or need clarification, please don't hesitate to reach out.

        Thank you for your understanding.

        Best regards,
        ${companyName} Team`;

            return this.sendEmail({ to, subject, htmlBody, textBody, from });
        };
    }

export const emailService = new EmailService();