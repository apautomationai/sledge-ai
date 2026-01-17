import nodemailer from "nodemailer";
import https from "https";
import http from "http";

interface Attachment {
    filename: string;
    content?: Buffer;
    path?: string;
    contentType?: string;
}

interface EmailParams {
    to: string | string[];
    subject: string;
    htmlBody?: string;
    textBody?: string;
    from?: string;
    attachments?: Attachment[];
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
    sendEmail = async ({ to, subject, htmlBody, textBody, from, attachments }: EmailParams) => {
        try {
            const info = await transporter.sendMail({
                from: from || this.defaultFrom,
                to: Array.isArray(to) ? to : [to],
                subject,
                html: htmlBody,
                text: textBody,
                attachments: attachments,
            });

            return info;
        } catch (err) {
            console.error("Error sending email:", err);
            throw new Error("Failed to send email");
        }
    };

    // Download file from URL and return as Buffer
    private downloadFileFromUrl = (url: string): Promise<Buffer> => {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            protocol.get(url, (response) => {
                // Handle redirects
                if (response.statusCode === 301 || response.statusCode === 302) {
                    const redirectUrl = response.headers.location;
                    if (redirectUrl) {
                        this.downloadFileFromUrl(redirectUrl).then(resolve).catch(reject);
                        return;
                    }
                }

                if (response.statusCode !== 200) {
                    reject(new Error(`Failed to download file: ${response.statusCode}`));
                    return;
                }

                const chunks: Buffer[] = [];
                response.on('data', (chunk) => chunks.push(chunk));
                response.on('end', () => resolve(Buffer.concat(chunks)));
                response.on('error', reject);
            }).on('error', reject);
        });
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

        return this.sendEmail({ to, subject, htmlBody, textBody, from: this.notificationFrom });
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
        invoiceFileUrl?: string;
    }) => {
        const {
            to,
            invoiceNumber,
            vendorName,
            rejectionReason,
            senderName,
            senderCompany,
            companyName = "Sledge",
            invoiceFileUrl
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

        // Prepare attachments if invoice file URL is provided
        let attachments: Attachment[] | undefined;
        if (invoiceFileUrl) {
            try {
                const fileBuffer = await this.downloadFileFromUrl(invoiceFileUrl);
                const filename = `Invoice_${invoiceNumber}.pdf`;
                attachments = [{
                    filename,
                    content: fileBuffer,
                    contentType: 'application/pdf',
                }];
            } catch (error) {
                console.error("Failed to download invoice attachment:", error);
            }
        }

        return this.sendEmail({ to, subject, htmlBody, textBody, from, attachments });
    };

    // send email verification email
    sendVerificationEmail = async (params: {
        to: string;
        firstName: string;
        verificationLink: string;
    }) => {
        const { to, firstName, verificationLink } = params;
        const subject = "Verify your Sledge account";

        const htmlBody = this.generateVerificationEmailHTML({ firstName, verificationLink });

        const textBody = `Hey ${firstName},

Welcome to Sledge! 👋

To get started, please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours.

If you didn't create an account with Sledge, you can safely ignore this email.

— The Sledge Team

Sledge
The Builder's AI Office`;

        return this.sendEmail({ to, subject, htmlBody, textBody, from: this.notificationFrom });
    };

    // Generate verification email HTML
    generateVerificationEmailHTML = (params: {
        firstName: string;
        verificationLink: string;
    }) => {
        const { firstName, verificationLink } = params;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 20px; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 700px; margin: 0 auto;">
                <tr>
                    <td>
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                            <!-- Header -->
                            <tr>
                                <td style="background-color: #1a1a1a; padding: 24px 30px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 700;">Verify Your Email</h1>
                                </td>
                            </tr>

                            <!-- Body Content -->
                            <tr>
                                <td style="padding: 30px; background-color: #ffffff;">
                                    <p style="margin: 0 0 16px 0; font-size: 18px; color: #333333;">
                                        Hey <strong>${firstName}</strong>, 👋
                                    </p>

                                    <p style="margin: 0 0 24px 0; font-size: 15px; color: #555555; line-height: 1.7;">
                                        Welcome to Sledge! To get started, please verify your email address by clicking the button below.
                                    </p>

                                    <!-- CTA Button -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="${verificationLink}" target="_blank" style="display: inline-block; background-color: #fbbf24; color: #1a1a1a; padding: 14px 32px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px;">
                                                    Verify Email Address
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin: 24px 0 16px 0; font-size: 14px; color: #6c757d;">
                                        This link will expire in 24 hours.
                                    </p>

                                    <p style="margin: 0; font-size: 14px; color: #6c757d;">
                                        If you didn't create an account with Sledge, you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #1a1a1a; padding: 20px 30px; text-align: center;">
                                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff; font-weight: 700;">
                                        Sledge
                                    </p>
                                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                        The Builder's AI Office
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

    // send welcome email to new user
    sendWelcomeEmail = async (params: {
        to: string;
        firstName: string;
        ctaLink: string;
    }) => {
        const { to, firstName, ctaLink } = params;
        const subject = "Welcome to Sledge — let's get your office off your back";

        const htmlBody = this.generateWelcomeEmailHTML({ firstName, ctaLink });

        const textBody = `Hey ${firstName},

Welcome to Sledge 👋

You're officially in.

Sledge is the Builder's AI Office — built to take paperwork, invoices, and back-office chaos off your plate so you can focus on building, not babysitting admin.

Here's what to do first (takes ~5 minutes):

1. Connect your inbox
Sledge watches for invoices and bills so you don't have to chase them down.

2. Review your first invoice
Approve, reject, or flag it — we'll handle the rest.

3. Send it to accounting
Seamlessly push approved invoices into your accounting system.

👉 Get started now: ${ctaLink}

What Sledge handles for you:
• Automatically receives and reads invoices
• Flags duplicates, missing info, and issues
• Keeps everything organized and searchable
• Creates a clean, auditable paper trail
• Saves hours every week (seriously)

This is just the beginning. Sledge starts with Accounts Payable — and grows into your entire office, powered by AI.

If you ever need help, hit reply or reach us at support@getsledge.com.

Let's get your time back.

— The Sledge Team

Sledge
The Builder's AI Office

This is an automated message. Replies are monitored by our support team.`;

        return this.sendEmail({ to, subject, htmlBody, textBody, from: this.notificationFrom });
    };

    // Generate welcome email HTML for preview (without sending)
    generateWelcomeEmailHTML = (params: {
        firstName: string;
        ctaLink: string;
    }) => {
        const { firstName, ctaLink } = params;

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
                                <td style="background-color: #1a1a1a; padding: 24px 30px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 700;">Welcome to Sledge</h1>
                                </td>
                            </tr>

                            <!-- Body Content -->
                            <tr>
                                <td style="padding: 30px; background-color: #ffffff;">

                                    <!-- Greeting -->
                                    <p style="margin: 0 0 16px 0; font-size: 18px; color: #333333;">
                                        Hey <strong>${firstName}</strong>, 👋
                                    </p>

                                    <p style="margin: 0 0 16px 0; font-size: 16px; color: #333333; font-weight: 600;">
                                        You're officially in.
                                    </p>

                                    <p style="margin: 0 0 24px 0; font-size: 15px; color: #555555; line-height: 1.7;">
                                        Sledge is the <strong>Builder's AI Office</strong> — built to take paperwork, invoices, and back-office chaos off your plate so you can focus on building, not babysitting admin.
                                    </p>

                                    <!-- Steps Section -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
                                        <tr>
                                            <td style="background-color: #f8f9fa; padding: 20px 24px; border-radius: 12px;">
                                                <p style="margin: 0 0 16px 0; color: #333333; font-weight: 700; font-size: 16px;">Here's what to do first <span style="color: #6c757d; font-weight: normal;">(takes ~5 minutes)</span></p>

                                                <!-- Step 1 -->
                                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                                                    <tr>
                                                        <td width="32" valign="top">
                                                            <div style="background-color: #1a1a1a; color: #fbbf24; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-weight: 700; font-size: 14px;">1</div>
                                                        </td>
                                                        <td style="padding-left: 8px;">
                                                            <p style="margin: 0 0 4px 0; font-weight: 700; color: #333333; font-size: 15px;">Connect your inbox</p>
                                                            <p style="margin: 0; color: #555555; font-size: 14px;">Sledge watches for invoices and bills so you don't have to chase them down.</p>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Step 2 -->
                                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                                                    <tr>
                                                        <td width="32" valign="top">
                                                            <div style="background-color: #1a1a1a; color: #fbbf24; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-weight: 700; font-size: 14px;">2</div>
                                                        </td>
                                                        <td style="padding-left: 8px;">
                                                            <p style="margin: 0 0 4px 0; font-weight: 700; color: #333333; font-size: 15px;">Review your first invoice</p>
                                                            <p style="margin: 0; color: #555555; font-size: 14px;">Approve, reject, or flag it — we'll handle the rest.</p>
                                                        </td>
                                                    </tr>
                                                </table>

                                                <!-- Step 3 -->
                                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                                    <tr>
                                                        <td width="32" valign="top">
                                                            <div style="background-color: #1a1a1a; color: #fbbf24; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-weight: 700; font-size: 14px;">3</div>
                                                        </td>
                                                        <td style="padding-left: 8px;">
                                                            <p style="margin: 0 0 4px 0; font-weight: 700; color: #333333; font-size: 15px;">Send it to accounting</p>
                                                            <p style="margin: 0; color: #555555; font-size: 14px;">Seamlessly push approved invoices into your accounting system.</p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- CTA Button -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
                                        <tr>
                                            <td align="center">
                                                <a href="${ctaLink}" target="_blank" style="display: inline-block; background-color: #fbbf24; color: #1a1a1a; padding: 14px 32px; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px;">
                                                    👉 Get started now
                                                </a>
                                            </td>
                                        </tr>
                                    </table>

                                    <!-- Features Section -->
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
                                        <tr>
                                            <td style="background-color: #2d2d2d; padding: 20px 24px; border-radius: 12px;">
                                                <p style="margin: 0 0 12px 0; color: #fbbf24; font-weight: 700; font-size: 16px;">What Sledge handles for you:</p>

                                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                                    <tr>
                                                        <td style="padding: 4px 0; color: #e5e7eb; font-size: 14px;">✓ Automatically receives and reads invoices</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 4px 0; color: #e5e7eb; font-size: 14px;">✓ Flags duplicates, missing info, and issues</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 4px 0; color: #e5e7eb; font-size: 14px;">✓ Keeps everything organized and searchable</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 4px 0; color: #e5e7eb; font-size: 14px;">✓ Creates a clean, auditable paper trail</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 4px 0; color: #e5e7eb; font-size: 14px;">✓ Saves hours every week (seriously)</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>

                                    <p style="margin: 0 0 16px 0; font-size: 15px; color: #555555; line-height: 1.7;">
                                        This is just the beginning. Sledge starts with Accounts Payable — and grows into your entire office, powered by AI.
                                    </p>

                                    <p style="margin: 0 0 16px 0; font-size: 15px; color: #555555; line-height: 1.7;">
                                        If you ever need help, hit reply or reach us at <a href="mailto:support@getsledge.com" style="color: #1a1a1a; font-weight: 600;">support@getsledge.com</a>.
                                    </p>

                                    <p style="margin: 0 0 8px 0; font-size: 15px; color: #333333; font-weight: 600;">
                                        Let's get your time back.
                                    </p>

                                    <p style="margin: 16px 0 0 0; font-size: 15px; color: #333333;">
                                        — <strong>The Sledge Team</strong>
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #1a1a1a; padding: 20px 30px; text-align: center;">
                                    <p style="margin: 0 0 4px 0; font-size: 14px; color: #ffffff; font-weight: 700;">
                                        Sledge
                                    </p>
                                    <p style="margin: 0 0 12px 0; font-size: 12px; color: #9ca3af;">
                                        The Builder's AI Office
                                    </p>
                                    <p style="margin: 0; font-size: 11px; color: #6b7280; font-style: italic;">
                                        This is an automated message. Replies are monitored by our support team.
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

    // send contact form email to support
    sendContactFormEmail = async (params: {
        firstName: string;
        lastName: string;
        email: string;
        subject: string;
        message: string;
    }) => {
        const { firstName, lastName, email, subject, message } = params;
        const to = "support@getsledge.com";
        const from = this.notificationFrom;

        // Map subject codes to readable labels
        const subjectLabels: Record<string, string> = {
            general: "General Question",
            technical: "Technical Support",
            billing: "Billing & Account",
            integrations: "Integrations (Email, QuickBooks, etc.)",
            sales: "Sales & Pricing",
            security: "Security, Privacy, or Legal",
            feedback: "Feedback or Feature Request",
            other: "Other"
        };

        const subjectLabel = subjectLabels[subject] || subject;
        const emailSubject = `New Contact Form Submission: ${subjectLabel}`;

        const htmlBody = this.generateContactFormEmailHTML({
            firstName,
            lastName,
            email,
            subject,
            message,
        });

        const textBody = `New Contact Form Submission

Name: ${firstName} ${lastName}
Email: ${email}
Subject: ${subjectLabel}

Message:
${message}

---
This message was submitted via the Sledge contact form.
Reply directly to this email to respond to ${firstName}.`;

        return this.sendEmail({
            to,
            subject: emailSubject,
            htmlBody,
            textBody,
            from,
        });
    };

    // Generate contact form email HTML
    generateContactFormEmailHTML = (params: {
        firstName: string;
        lastName: string;
        email: string;
        subject: string;
        message: string;
    }) => {
        const { firstName, lastName, email, subject, message } = params;

        // Map subject codes to readable labels
        const subjectLabels: Record<string, string> = {
            general: "General Question",
            technical: "Technical Support",
            billing: "Billing & Account",
            integrations: "Integrations (Email, QuickBooks, etc.)",
            sales: "Sales & Pricing",
            security: "Security, Privacy, or Legal",
            feedback: "Feedback or Feature Request",
            other: "Other"
        };

        const subjectLabel = subjectLabels[subject] || subject;

        return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333333; background-color: #f5f5f5;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 700px; margin: 0 auto;">
            <tr>
                <td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">

                        <!-- Header -->
                        <tr>
                            <td style="background-color: #1a1a1a; padding: 24px 30px; text-align: center;">
                                <h1 style="margin: 0; font-size: 24px; color: #fbbf24; font-weight: 700;">New Contact Form Submission</h1>
                            </td>
                        </tr>

                        <!-- Body Content -->
                        <tr>
                            <td style="padding: 30px; background-color: #ffffff;">

                                <!-- Contact Info Box -->
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0 0 24px 0;">
                                    <tr>
                                        <td style="background-color: #f8f9fa; padding: 20px 24px; border-radius: 12px;">
                                            <p style="margin: 0 0 12px 0; color: #333333; font-weight: 700; font-size: 16px;">Contact Information</p>

                                            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                                <tr>
                                                    <td style="padding: 4px 0; color: #555555; font-size: 14px;">
                                                        <strong>Name:</strong> ${firstName} ${lastName}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 4px 0; color: #555555; font-size: 14px;">
                                                        <strong>Email:</strong> <a href="mailto:${email}" style="color: #1a1a1a; text-decoration: none;">${email}</a>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 4px 0; color: #555555; font-size: 14px;">
                                                        <strong>Subject:</strong> ${subjectLabel}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Message Content -->
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 24px 0;">
                                    <tr>
                                        <td style="background-color: #2d2d2d; padding: 20px 24px; border-radius: 12px;">
                                            <p style="margin: 0 0 12px 0; color: #fbbf24; font-weight: 700; font-size: 16px;">Message</p>
                                            <p style="margin: 0; color: #e5e7eb; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
                                        </td>
                                    </tr>
                                </table>

                                <p style="margin: 24px 0 0 0; font-size: 13px; color: #6c757d; font-style: italic;">
                                    Reply directly to this email to respond to ${firstName}.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef; text-align: center;">
                                <p style="margin: 0; font-size: 12px; color: #6c757d;">
                                    This message was submitted via the Sledge contact form at <strong style="color: #333333;">getsledge.com/contact-us</strong>
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