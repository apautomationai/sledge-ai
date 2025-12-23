import { sessionsModel } from '@/models/sessions';
import { projectsModel } from '@/models/projects.model';
import { quickbooksVendorsModel } from '@/models/quickbooks-vendors.model';
import db from '@/lib/db';
import { eq, and, or, ilike, gte, lte, desc, asc, count, SQL } from "drizzle-orm";
import crypto from "crypto";
import { sessionService } from './session.service';
import { emailService } from './email.service';
import { lienWaiversModel } from '@/models/lien-waivers.model';
import { projectVendorsModel } from '@/models/project-vendors.model';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { uploadBufferToS3 } from '@/helpers/s3upload';

interface GetLienWaiversParams {
    userId: number;
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

class LienWaiverService {

    // get all lien waivers with pagination, search, filter and sort
    async getAllLienWaivers({
        userId,
        page = 1,
        limit = 10,
        search = "",
        status = "",
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
    }: GetLienWaiversParams) {
        const offset = (page - 1) * limit;

        // Build where condition based on filters
        const baseCondition = eq(lienWaiversModel.userId, userId);

        const searchCondition = search
            ? or(
                ilike(lienWaiversModel.vendorName, `%${search}%`),
                ilike(lienWaiversModel.customerName, `%${search}%`)
            )
            : undefined;

        const statusCondition = status === 'signed'
            ? eq(lienWaiversModel.isSigned, true)
            : status === 'pending'
            ? eq(lienWaiversModel.isSigned, false)
            : undefined;

        const startDateCondition = startDate
            ? gte(lienWaiversModel.createdAt, startDate)
            : undefined;

        const endDateCondition = endDate
            ? lte(lienWaiversModel.createdAt, endDate)
            : undefined;

        // Combine all conditions (filter out undefined)
        const allConditions = [
            baseCondition,
            searchCondition,
            statusCondition,
            startDateCondition,
            endDateCondition,
        ].filter(Boolean) as SQL<unknown>[];

        const whereCondition = allConditions.length === 1
            ? allConditions[0]
            : and(...allConditions);

        // Get total count
        const [countResult] = await db
            .select({ count: count() })
            .from(lienWaiversModel)
            .where(whereCondition);

        const total = countResult?.count || 0;

        // Determine sort column and order
        const sortColumn = sortBy === 'vendorName'
            ? lienWaiversModel.vendorName
            : sortBy === 'throughDate'
            ? lienWaiversModel.throughDate
            : lienWaiversModel.createdAt;

        const orderFn = sortOrder === 'asc' ? asc : desc;

        // Get paginated lien waivers with project info
        const lienWaivers = await db
            .select({
                id: lienWaiversModel.id,
                projectId: lienWaiversModel.projectId,
                projectName: projectsModel.name,
                projectAddress: projectsModel.address,
                waiverType: lienWaiversModel.waiverType,
                billingCycle: lienWaiversModel.billingCycle,
                throughDate: lienWaiversModel.throughDate,
                vendorName: lienWaiversModel.vendorName,
                vendorEmail: lienWaiversModel.vendorEmail,
                customerName: lienWaiversModel.customerName,
                amount: lienWaiversModel.amount,
                isSigned: lienWaiversModel.isSigned,
                signedAt: lienWaiversModel.signedAt,
                signedFileUrl: lienWaiversModel.signedFileUrl,
                createdAt: lienWaiversModel.createdAt,
            })
            .from(lienWaiversModel)
            .leftJoin(
                projectsModel,
                eq(lienWaiversModel.projectId, projectsModel.id.toString())
            )
            .where(whereCondition)
            .orderBy(orderFn(sortColumn))
            .limit(limit)
            .offset(offset);

        const totalPages = Math.ceil(total / limit);

        return {
            lienWaivers,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }

    // get lien waiver by id
    async getLienWaiverById(userId: number, lienWaiverId: number) {
        const [lienWaiver] = await db
            .select({
                id: lienWaiversModel.id,
                projectId: lienWaiversModel.projectId,
                projectName: projectsModel.name,
                projectAddress: projectsModel.address,
                waiverType: lienWaiversModel.waiverType,
                billingCycle: lienWaiversModel.billingCycle,
                throughDate: lienWaiversModel.throughDate,
                vendorName: lienWaiversModel.vendorName,
                vendorEmail: lienWaiversModel.vendorEmail,
                customerName: lienWaiversModel.customerName,
                amount: lienWaiversModel.amount,
                isSigned: lienWaiversModel.isSigned,
                signedAt: lienWaiversModel.signedAt,
                signedFileUrl: lienWaiversModel.signedFileUrl,
                createdAt: lienWaiversModel.createdAt,
            })
            .from(lienWaiversModel)
            .leftJoin(
                projectsModel,
                eq(lienWaiversModel.projectId, projectsModel.id.toString())
            )
            .where(
                and(
                    eq(lienWaiversModel.id, lienWaiverId),
                    eq(lienWaiversModel.userId, userId)
                )
            )
            .limit(1);

        return lienWaiver || null;
    }


    // process all projects' billing cycle and create lien waivers (cron job)
    async processAllProjectsBillingCycle() {
        try {
            // Get all active projects
            const projects = await db
                .select()
                .from(projectsModel)
                .where(eq(projectsModel.isDeleted, false));

            const results = {
                processed: 0,
                lienWaiversCreated: 0,
                emailSent: 0,
                errors: [] as string[],
            };

            for (const project of projects) {
                try {
                    results.processed++;

                    // check if billing cycle is today
                    const isBillingCycleToday = await this.checkBillingCycle(project);

                    // Create lien waiver (if billing cycle is today)
                    if (isBillingCycleToday) {
                        // Join project_vendors with quickbooks_vendors to get vendor details
                        const projectVendorsWithDetails = await db
                            .select({
                                projectVendor: projectVendorsModel,
                                vendor: {
                                    id: quickbooksVendorsModel.id,
                                    displayName: quickbooksVendorsModel.displayName,
                                    companyName: quickbooksVendorsModel.companyName,
                                    primaryEmail: quickbooksVendorsModel.primaryEmail,
                                },
                            })
                            .from(projectVendorsModel)
                            .innerJoin(
                                quickbooksVendorsModel,
                                eq(projectVendorsModel.vendorId, quickbooksVendorsModel.id)
                            )
                            .where(eq(projectVendorsModel.projectId, project.id));

                        if (projectVendorsWithDetails.length === 0) {
                            continue;
                        }

                        for (const { vendor } of projectVendorsWithDetails) {
                            // Skip if vendor has no email
                            if (!vendor.primaryEmail) {
                                results.errors.push(`Project ${project.id}: Vendor ${vendor.displayName || vendor.id} has no email`);
                                continue;
                            }

                            const newLienWaiver = await this.createLienWaiver(project, vendor);

                            results.lienWaiversCreated++;

                            const session = await sessionService.createSession("lien-waiver", {
                                projectId: project.id,
                                lienWaiver: JSON.stringify(newLienWaiver.data),
                            });

                            const lienWaiverUrl = `${process.env.FRONTEND_URL}/vendor-lien-waiver?token=${session.token}`;

                            // send the lien waiver to the vendor
                            await emailService.sendLienWaiver(vendor.primaryEmail, lienWaiverUrl);
                            results.emailSent++;
                        }
                        continue;
                    }
                } catch (error: any) {
                    results.errors.push(`Project ${project.id}: ${error.message}`);
                }
            }

            return {
                success: true,
                message: 'Billing cycle processed',
                data: results,
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
            };
        }
    }

    // Check if the project's billing cycle is due today
    async checkBillingCycle(project: any) {
        // Logic to check if the project's billing cycle is due today
        return true; // For demonstration, always return true
    }

    async createLienWaiver(project: any, vendor: any) {
        // create the db record

        const vendorName = vendor.displayName || vendor.companyName || 'Unknown Vendor';

        const newLienWaiver = await db
            .insert(lienWaiversModel)
            .values({
                userId: project.userId,
                projectId: project.id.toString(),
                billingCycle: project.currentBillingCycle,
                throughDate: new Date().toISOString(),
                vendorName: vendorName,
                vendorEmail: vendor.primaryEmail,
                customerName: project.userId.toString(),
                amount: "1000.00",           
            })
            .returning();

        // return the result
        return {
            sucess: true,
            data: newLienWaiver
        };
    }

    async createSession({ data }: any) {
        const token = crypto.randomBytes(32).toString("hex"); // 64-char secure token
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(); // 2 hours

        const record = await db
            .insert(sessionsModel)
            .values({
                token,
                type: "lien-waiver",
                data,
                expiresAt,
            })
            .returning();

        return record[0];
    }    

    /**
     * Generate a lien waiver PDF and upload to S3
     */
    async generateAndUploadLienWaiverPdf(lienWaiverId: number) {
        // Get lien waiver data
        const [lienWaiver] = await db
            .select()
            .from(lienWaiversModel)
            .where(eq(lienWaiversModel.id, lienWaiverId))
            .limit(1);

        if (!lienWaiver) {
            throw new Error('Lien waiver not found');
        }

        // Get project data
        const [project] = await db
            .select()
            .from(projectsModel)
            .where(eq(projectsModel.id, parseInt(lienWaiver.projectId)))
            .limit(1);

        // Create PDF document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([612, 792]); // Letter size
        const { height } = page.getSize();

        // Load fonts
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Colors
        const black = rgb(0, 0, 0);
        const gray = rgb(0.4, 0.4, 0.4);

        let yPosition = height - 50;
        const leftMargin = 50;
        const lineHeight = 20;

        // Title
        page.drawText('LIEN WAIVER', {
            x: leftMargin,
            y: yPosition,
            size: 24,
            font: helveticaBold,
            color: black,
        });
        yPosition -= 40;

        // Waiver Type
        const waiverTypeText = lienWaiver.waiverType === 'conditional'
            ? 'CONDITIONAL WAIVER AND RELEASE ON PROGRESS PAYMENT'
            : 'UNCONDITIONAL WAIVER AND RELEASE ON PROGRESS PAYMENT';

        page.drawText(waiverTypeText, {
            x: leftMargin,
            y: yPosition,
            size: 12,
            font: helveticaBold,
            color: black,
        });
        yPosition -= 35;

        // Project Information Section
        page.drawText('PROJECT INFORMATION', {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helveticaBold,
            color: gray,
        });
        yPosition -= lineHeight;

        const projectName = project?.name || 'N/A';
        const projectAddress = project?.address || 'N/A';

        page.drawText(`Project Name: ${projectName}`, {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helvetica,
            color: black,
        });
        yPosition -= lineHeight;

        page.drawText(`Project Address: ${projectAddress}`, {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helvetica,
            color: black,
        });
        yPosition -= 30;

        // Vendor Information Section
        page.drawText('VENDOR INFORMATION', {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helveticaBold,
            color: gray,
        });
        yPosition -= lineHeight;

        page.drawText(`Vendor Name: ${lienWaiver.vendorName}`, {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helvetica,
            color: black,
        });
        yPosition -= lineHeight;

        if (lienWaiver.vendorEmail) {
            page.drawText(`Vendor Email: ${lienWaiver.vendorEmail}`, {
                x: leftMargin,
                y: yPosition,
                size: 11,
                font: helvetica,
                color: black,
            });
            yPosition -= lineHeight;
        }
        yPosition -= 15;

        // Payment Information Section
        page.drawText('PAYMENT INFORMATION', {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helveticaBold,
            color: gray,
        });
        yPosition -= lineHeight;

        page.drawText(`Customer/Owner: ${lienWaiver.customerName || 'N/A'}`, {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helvetica,
            color: black,
        });
        yPosition -= lineHeight;

        page.drawText(`Through Date: ${new Date(lienWaiver.throughDate).toLocaleDateString()}`, {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helvetica,
            color: black,
        });
        yPosition -= lineHeight;

        page.drawText(`Amount: $${parseFloat(lienWaiver.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helvetica,
            color: black,
        });
        yPosition -= lineHeight;

        page.drawText(`Billing Cycle: ${lienWaiver.billingCycle}`, {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helvetica,
            color: black,
        });
        yPosition -= 35;

        // Waiver Text
        page.drawText('WAIVER STATEMENT', {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helveticaBold,
            color: gray,
        });
        yPosition -= lineHeight;

        const waiverStatement = lienWaiver.waiverType === 'conditional'
            ? 'Upon receipt of payment of the sum stated above, the undersigned waives and releases any lien, stop payment notice, or bond right the undersigned has for labor, services, equipment, or materials furnished to the above-referenced project through the date stated above.'
            : 'The undersigned has been paid and has received a progress payment for labor, services, equipment, or materials furnished to the above-referenced project and hereby waives and releases any lien, stop payment notice, or bond right for all work performed through the date stated above.';

        // Word wrap the waiver statement
        const words = waiverStatement.split(' ');
        let line = '';
        const maxWidth = 512;

        for (const word of words) {
            const testLine = line + (line ? ' ' : '') + word;
            const textWidth = helvetica.widthOfTextAtSize(testLine, 10);

            if (textWidth > maxWidth && line) {
                page.drawText(line, {
                    x: leftMargin,
                    y: yPosition,
                    size: 10,
                    font: helvetica,
                    color: black,
                });
                yPosition -= 15;
                line = word;
            } else {
                line = testLine;
            }
        }
        if (line) {
            page.drawText(line, {
                x: leftMargin,
                y: yPosition,
                size: 10,
                font: helvetica,
                color: black,
            });
            yPosition -= 35;
        }

        // Signature Section
        page.drawText('SIGNATURE', {
            x: leftMargin,
            y: yPosition,
            size: 11,
            font: helveticaBold,
            color: gray,
        });
        yPosition -= 25;

        // Signature line
        page.drawLine({
            start: { x: leftMargin, y: yPosition },
            end: { x: leftMargin + 250, y: yPosition },
            thickness: 1,
            color: black,
        });
        yPosition -= 15;

        page.drawText('Authorized Signature', {
            x: leftMargin,
            y: yPosition,
            size: 9,
            font: helvetica,
            color: gray,
        });
        yPosition -= 30;

        // Date line
        page.drawLine({
            start: { x: leftMargin, y: yPosition },
            end: { x: leftMargin + 150, y: yPosition },
            thickness: 1,
            color: black,
        });
        yPosition -= 15;

        page.drawText('Date', {
            x: leftMargin,
            y: yPosition,
            size: 9,
            font: helvetica,
            color: gray,
        });

        // Footer
        page.drawText(`Generated on ${new Date().toLocaleDateString()} | Lien Waiver ID: ${lienWaiverId}`, {
            x: leftMargin,
            y: 30,
            size: 8,
            font: helvetica,
            color: gray,
        });

        // Save PDF
        const pdfBytes = await pdfDoc.save();
        const pdfBuffer = Buffer.from(pdfBytes);

        // Upload to S3
        const s3Key = `lien-waivers/LW-${lienWaiverId}-${Date.now()}.pdf`;
        const s3Url = await uploadBufferToS3(pdfBuffer, s3Key, 'application/pdf');

        // Update database record
        await db
            .update(lienWaiversModel)
            .set({
                signedFileUrl: s3Url,
            })
            .where(eq(lienWaiversModel.id, lienWaiverId));

        return {
            success: true,
            data: {
                lienWaiverId,
                fileUrl: s3Url,
                fileKey: s3Key,
            },
        };
    }

    // Mark lien waiver as signed and upload signed PDF
    async signLienWaiver(lienWaiverId: number, signatureData?: string) {
        // Generate and upload PDF
        const uploadResult = await this.generateAndUploadLienWaiverPdf(lienWaiverId);

        // Update as signed
        await db
            .update(lienWaiversModel)
            .set({
                isSigned: true,
                signedAt: new Date().toISOString(),
                signedFileUrl: uploadResult.data.fileUrl,
            })
            .where(eq(lienWaiversModel.id, lienWaiverId));

        return {
            success: true,
            data: {
                lienWaiverId,
                signedAt: new Date().toISOString(),
                fileUrl: uploadResult.data.fileUrl,
            },
        };
    }
}

export const lienWaiverService = new LienWaiverService();
