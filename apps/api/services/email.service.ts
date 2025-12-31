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

    // send invoice rejection email to one or multiple recipients
    sendInvoiceRejectionEmail = async (params: {
        to: string | string[];
        invoiceNumber: string;
        vendorName?: string;
        rejectionReason?: string;
        companyName?: string;
        senderName?: string;
        senderCompany?: string;
    }) => {
        const {
            to,
            invoiceNumber,
            vendorName,
            rejectionReason,
            senderName,
            senderCompany,
            companyName = "Sledge"
        } = params;
        const from = this.notificationFrom;
        const subject = `Invoice ${invoiceNumber} - Changes Required`;

        const htmlBody = this.generateInvoiceRejectionEmailHTML({
            invoiceNumber,
            vendorName,
            rejectionReason,
            companyName,
            senderName,
            senderCompany
        });

        const textBody = `Invoice: ${invoiceNumber} - To: ${vendorName || 'Vendor'}

            ⚠ CHANGES REQUIRED

            Hello ${vendorName || 'there'},

            This is ${senderName} from ${senderCompany}.

            I've reviewed your invoice ${invoiceNumber} that was sent to ${senderCompany}, and it needs an update before we can move forward.

            ${rejectionReason ? `Reason for the update:
            ${rejectionReason}\n` : ''}
            ---
            What to do next:
            Please make the necessary correction and send a new, updated invoice to the same email address you used when submitting the original invoice.

            ⚠ Do not reply to this email.
            Replies are not monitored and will not be processed.

            Once the updated invoice is received, it will automatically re-enter my approval workflow.

            Thanks,
            ${senderName}
            ${senderCompany}

            ---
            This is an automated message sent via ${companyName} on behalf of ${senderCompany}.
            ${companyName}: The Builder's AI Office is used to receive, review and process invoices.
            Please do not reply directly to this email.`;

        return this.sendEmail({ to, subject, htmlBody, textBody, from });
    };

    // Generate invoice rejection email HTML for preview (without sending)
    generateInvoiceRejectionEmailHTML = (params: {
        invoiceNumber: string;
        vendorName?: string;
        rejectionReason?: string;
        companyName?: string;
        senderName?: string;
        senderCompany?: string;
    }) => {
        const {
            invoiceNumber,
            vendorName,
            rejectionReason,
            companyName = "Sledge",
            senderName = "Team Member",
            senderCompany = companyName
        } = params;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <!--[if mso]>
            <style type="text/css">
                table, td { border-collapse: collapse; }
            </style>
            <![endif]-->
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5;">
            <!-- Main Container Table -->
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 700px; margin: 0 auto;">
                <tr>
                    <td>
                        <!-- Email Container -->
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">

                            <!-- Header -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-bottom: 1px solid #e9ecef;">
                                    <p style="margin: 0; font-size: 14px; color: #6c757d; font-weight: 600;">
                                        Invoice: <strong style="color: #333333;">${invoiceNumber}</strong> &bull; To: <strong style="color: #333333;">${vendorName || 'Vendor'}</strong>
                                    </p>
                                </td>
                            </tr>

                            <!-- Status Badge Row -->
                            <tr>
                                <td align="center" style="padding: 0; background-color: #ffffff;">
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                            <td style="background-color: #1a1a1a; color: #fbbf24; padding: 8px 24px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-radius: 6px;">
                                                &#9679; CHANGES REQUIRED
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- Body Content -->
                            <tr>
                                <td style="padding: 30px; background-color: #ffffff;">

                                    <!-- Greeting -->
                                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333333;">
                                        Hello <strong>${vendorName || 'there'}</strong>,
                                    </p>

                                    <p style="margin: 0 0 10px 0; font-size: 16px; color: #333333;">
                                        This is <strong>${senderName}</strong> from <strong>${senderCompany}</strong>.
                                    </p>

                                    <p style="margin: 0 0 20px 0; font-size: 15px; color: #333333;">
                                        I've reviewed your invoice <strong>${invoiceNumber}</strong> that was sent to <strong>${senderCompany}</strong>,
                                        and it needs an update before we can move forward.
                                    </p>

                                    ${rejectionReason ? `
                                    <!-- Reason Box -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 12px 0;">
                                        <tr>
                                            <td style="background-color: #fef3c7; border-left: 4px solid #fbbf24; padding: 12px 20px; border-radius: 6px;">
                                                <p style="margin: 0 0 4px 0; font-weight: 700; color: #000000; font-size: 16px;">Reason for the update</p>
                                                <p style="margin: 0; color: #5a5252; font-size: 14px; line-height: 1.5;">${rejectionReason}</p>
                                            </td>
                                        </tr>
                                    </table>
                                    ` : ''}

                                    <!-- Action Box -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
                                        <tr>
                                            <td style="background-color: #2d2d2d; padding: 16px 24px; border-radius: 14px;">
                                                <p style="margin: 0 0 12px 0; color: #fbbf24; font-weight: 700; font-size: 18px;">What to do next</p>

                                                <p style="margin: 0 0 10px 0; font-size: 14px; line-height: 1.7; color: #e5e7eb;">
                                                    Please make the necessary correction and send a <strong style="color: #fbbf24;">new, updated invoice</strong> to
                                                    the <strong style="color: #fbbf24;">same email address</strong> you used when submitting the original invoice.
                                                </p>

                                                <!-- Warning Notice -->
                                               <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                                    <tr>
                                                        <td style="background-color: rgba(0,0,0,0.1); padding: 10px; border-radius: 6px;">
                                                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                                                <tr>
                                                                    <td width="10" valign="top" style="color: #fbbf24; font-size: 18px; font-weight: bold;">&#9888;</td>
                                                                    <td style="padding-left: 6px;">
                                                                        <p style="margin: 0; font-weight: 700; color: #ffffff; font-size: 13px;">Do not reply to this email.</p>
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td colspan="2">
                                                                        <p style="margin: 0; color: #f3f4f6; font-size: 13px; font-weight: 700;">Replies are not monitored and will not be processed.</p>
                                                                    </td>
                                                                </tr>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin: 0 0 6px 0; font-size: 14px; color: #333333;">
                                        Once the updated invoice is received, it will automatically re-enter my approval workflow.
                                    </p>

                                    <p style="margin: 0 0 6px 0; font-size: 14px; color: #333333;">Thanks,</p>

                                    <p style="margin: 8px 0 0 0; font-size: 15px; color: #333333;">
                                        <strong>${senderName}</strong><br>
                                        <strong>${senderCompany}</strong>
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef;">
                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #6c757d; line-height: 1.5;">
                                        This is an automated message sent via <strong style="color: #333333;">${companyName}</strong> on behalf of <strong style="color: #333333;">${senderCompany}</strong>.
                                    </p>
                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #6c757d; line-height: 1.5;">
                                        <strong style="color: #333333;">${companyName}</strong>: The Builder's AI Office is used to receive, review and process invoices.
                                    </p>
                                    <p style="margin: 0; font-size: 12px; color: #6c757d; font-style: italic;">
                                        Please do not reply directly to this email.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
    };
}

export const emailService = new EmailService();