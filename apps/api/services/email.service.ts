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
    private defaultFrom = process.env.AUTH_EMAIL_FROM || "auth@getsledge.com";

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
}

export const emailService = new EmailService();