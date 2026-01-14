import db from "@/lib/db";
import { quickbooksVendorsModel } from "@/models/quickbooks-vendors.model";
import { projectVendorsModel } from "@/models/project-vendors.model";
import { projectsModel } from "@/models/projects.model";
import { invoiceModel } from "@/models/invoice.model";
import { eq, and, ilike, count, or } from "drizzle-orm";
import { QuickBooksService } from "@/services/quickbooks.service";

interface GetVendorsParams {
    userId: number;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

interface VendorBase {
    id: number;
    displayName: string | null;
    companyName: string | null;
    email: string | null;
    phone: string | null;
}

interface VendorWithCounts {
    id: number;
    name: string;
    displayName: string | null;
    companyName: string | null;
    email: string | null;
    phone: string | null;
    projectCount: number;
    invoiceCount: number;
    lienWaiverCount: number;
}

class VendorsService {
    async getVendors({
        userId,
        page = 1,
        limit = 10,
        search = "",
        sortBy = "name",
        sortOrder = "asc",
    }: GetVendorsParams) {
        const offset = (page - 1) * limit;

        // Build where condition based on search
        const whereCondition = search
            ? and(
                eq(quickbooksVendorsModel.userId, userId),
                ilike(quickbooksVendorsModel.displayName, `%${search}%`)
            )
            : eq(quickbooksVendorsModel.userId, userId);

        // Get all vendors for this user
        const allVendors: VendorBase[] = await db
            .select({
                id: quickbooksVendorsModel.id,
                displayName: quickbooksVendorsModel.displayName,
                companyName: quickbooksVendorsModel.companyName,
                email: quickbooksVendorsModel.primaryEmail,
                phone: quickbooksVendorsModel.primaryPhone,
            })
            .from(quickbooksVendorsModel)
            .where(whereCondition);

        // Get counts for each vendor
        const vendorsWithCounts: VendorWithCounts[] = await Promise.all(
            allVendors.map(async (vendor: VendorBase) => {
                // Count projects for this vendor
                const projectCountResult = await db
                    .select({ count: count() })
                    .from(projectVendorsModel)
                    .where(
                        and(
                            eq(projectVendorsModel.vendorId, vendor.id),
                            eq(projectVendorsModel.isDeleted, false)
                        )
                    );

                // Count invoices for this vendor (by matching vendor name)
                const invoiceCountResult = await db
                    .select({ count: count() })
                    .from(invoiceModel)
                    .where(
                        and(
                            eq(invoiceModel.userId, userId),
                            eq(invoiceModel.isDeleted, false),
                            eq(invoiceModel.vendorId, vendor.id)
                        )
                    );

                // Count lien waivers for this vendor (uncomment below code when lien-waivers are linked properly)
                // const lienWaiverCountResult = await db
                //     .select({ count: count() })
                //     .from(lienWaiversModel)
                //     .where(
                //         ilike(lienWaiversModel.vendorName, `%${vendor.displayName || ""}%`)
                //     );

                return {
                    id: vendor.id,
                    name: vendor.displayName || vendor.companyName || "Unknown",
                    displayName: vendor.displayName,
                    companyName: vendor.companyName,
                    email: vendor.email,
                    phone: vendor.phone,
                    projectCount: projectCountResult[0]?.count || 0,
                    invoiceCount: invoiceCountResult[0]?.count || 0,
                    lienWaiverCount: 0,
                };
            })
        );

        // Sort vendors
        const sortedVendors = vendorsWithCounts.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            switch (sortBy) {
                case "name":
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case "projectCount":
                    aValue = a.projectCount;
                    bValue = b.projectCount;
                    break;
                case "invoiceCount":
                    aValue = a.invoiceCount;
                    bValue = b.invoiceCount;
                    break;
                case "lienWaiverCount":
                    aValue = a.lienWaiverCount;
                    bValue = b.lienWaiverCount;
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
            if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        // Paginate
        const paginatedVendors = sortedVendors.slice(offset, offset + limit);
        const total = sortedVendors.length;
        const totalPages = Math.ceil(total / limit);

        return {
            vendors: paginatedVendors,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    }

    async getVendorById(userId: number, vendorId: number) {
        const vendor = await db
            .select()
            .from(quickbooksVendorsModel)
            .where(
                and(
                    eq(quickbooksVendorsModel.id, vendorId),
                    eq(quickbooksVendorsModel.userId, userId)
                )
            )
            .limit(1);

        if (!vendor.length) {
            return null;
        }

        const v = vendor[0];

        // Get projects linked to this vendor via project_vendors table
        const projects = await db
            .select({
                id: projectsModel.id,
                name: projectsModel.name,
                address: projectsModel.address,
                city: projectsModel.city,
                state: projectsModel.state,
                postalCode: projectsModel.postalCode,
                imageUrl: projectsModel.imageUrl,
                totalInvoiced: projectVendorsModel.totalInvoiced,
                invoiceCount: projectVendorsModel.invoiceCount,
                firstInvoiceDate: projectVendorsModel.firstInvoiceDate,
                lastInvoiceDate: projectVendorsModel.lastInvoiceDate,
            })
            .from(projectVendorsModel)
            .innerJoin(
                projectsModel,
                eq(projectVendorsModel.projectId, projectsModel.id)
            )
            .where(
                and(
                    eq(projectVendorsModel.vendorId, vendorId),
                    eq(projectVendorsModel.isDeleted, false),
                    eq(projectsModel.isDeleted, false)
                )
            );

        // Get invoices linked to this vendor by matching vendor name
        const invoices = await db
            .select({
                id: invoiceModel.id,
                invoiceNumber: invoiceModel.invoiceNumber,
                vendorId: invoiceModel.vendorId,
                customerId: invoiceModel.customerId,
                invoiceDate: invoiceModel.invoiceDate,
                dueDate: invoiceModel.dueDate,
                totalAmount: invoiceModel.totalAmount,
                currency: invoiceModel.currency,
                status: invoiceModel.status,
                fileUrl: invoiceModel.fileUrl,
                createdAt: invoiceModel.createdAt,
            })
            .from(invoiceModel)
            .where(
                and(
                    eq(invoiceModel.userId, userId),
                    eq(invoiceModel.isDeleted, false),
                    eq(invoiceModel.vendorId, v.id)
                )
            );

        // Get lien waivers linked to this vendor (uncomment below code when lien-waivers are linked properly)
        // const lienWaivers = await db
        //     .select({
        //         id: lienWaiversModel.id,
        //         projectId: lienWaiversModel.vendorId,
        //         waiverType: lienWaiversModel.waiverType,
        //         billingCycle: lienWaiversModel.billingCycle,
        //         throughDate: lienWaiversModel.throughDate,
        //         vendorName: lienWaiversModel.vendorName,
        //         vendorEmail: lienWaiversModel.vendorEmail,
        //         customerName: lienWaiversModel.customerName,
        //         amount: lienWaiversModel.amount,
        //         isSigned: lienWaiversModel.isSigned,
        //         signedAt: lienWaiversModel.signedAt,
        //         signedFileUrl: lienWaiversModel.signedFileUrl,
        //         createdAt: lienWaiversModel.createdAt,
        //     })
        //     .from(lienWaiversModel)
        //     .innerJoin(
        //         projectsModel,
        //         eq(lienWaiversModel.vendorId, projectsModel.id)
        //     )
        //     .where(
        //         and(
        //             eq(projectsModel.userId, userId),
        //             or(
        //                 eq(lienWaiversModel.vendorId, String(vendorId)),
        //                 ilike(lienWaiversModel.vendorName, `%${v.displayName || ""}%`),
        //                 ilike(lienWaiversModel.vendorName, `%${v.companyName || ""}%`)
        //             )
        //         )
        //     );

        return {
            id: v.id,
            name: v.displayName || v.companyName || "Unknown",
            displayName: v.displayName,
            companyName: v.companyName,
            contact: {
                name: `${v.givenName || ""} ${v.familyName || ""}`.trim() || v.displayName,
                email: v.primaryEmail,
                phone: v.primaryPhone,
                website: v.website,
            },
            taxId: v.taxIdentifier,
            address: {
                line1: v.billAddrLine1,
                line2: v.billAddrLine2,
                city: v.billAddrCity,
                state: v.billAddrState,
                postalCode: v.billAddrPostalCode,
                country: v.billAddrCountry,
            },
            projects,
            invoices,
            lienWaivers: [],
            projectCount: projects.length,
            invoiceCount: invoices.length,
            lienWaiverCount: 0,
            active: v.active,
            balance: v.balance,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
        };
    }

    /**
     * Find existing vendor by name or create a new one in QuickBooks
     * Requires QuickBooks integration to be connected
     * @param userId - The user ID who owns the vendor
     * @param vendorData - Vendor data from invoice
     * @returns Vendor ID (existing or newly created)
     */
    async findOrCreateVendor(
        userId: number,
        vendorData: {
            vendor_name: string;
            vendor_address?: string;
            vendor_phone?: string;
            vendor_email?: string;
        }
    ): Promise<number> {
        // Trim vendor name for consistent matching
        const trimmedVendorName = vendorData.vendor_name.trim();

        // Search for existing vendor by displayName or companyName (case-insensitive)
        const existingVendors = await db
            .select()
            .from(quickbooksVendorsModel)
            .where(
                and(
                    eq(quickbooksVendorsModel.userId, userId),
                    or(
                        ilike(quickbooksVendorsModel.displayName, trimmedVendorName),
                        ilike(quickbooksVendorsModel.companyName, trimmedVendorName)
                    )
                )
            )
            .limit(1);

        if (existingVendors.length > 0) {
            return existingVendors[0].id;
        }

        // Vendor not found, create in QuickBooks
        const quickbooksService = new QuickBooksService();
        const integration = await quickbooksService.getUserIntegration(userId);

        if (!integration) {
            throw new Error("QuickBooks integration not found. Please connect your QuickBooks account.");
        }

        // Create vendor in QuickBooks
        const qbResult = await quickbooksService.createVendor(integration, {
            name: trimmedVendorName,
            email: vendorData.vendor_email,
            phone: vendorData.vendor_phone,
            address: vendorData.vendor_address
        });

        // Extract the created vendor data
        const newVendor = qbResult?.Vendor || qbResult?.QueryResponse?.Vendor?.[0];

        if (!newVendor || !newVendor.Id) {
            throw new Error("Failed to create vendor in QuickBooks");
        }

        // Find the synced vendor in our database
        const syncedVendors = await db
            .select()
            .from(quickbooksVendorsModel)
            .where(
                and(
                    eq(quickbooksVendorsModel.userId, userId),
                    eq(quickbooksVendorsModel.quickbooksId, newVendor.Id.toString())
                )
            )
            .limit(1);

        if (syncedVendors.length > 0) {
            return syncedVendors[0].id;
        }

        throw new Error("Vendor was created in QuickBooks but failed to sync to database");
    }

    async updateVendor(vendorId: number, updateData: any) {
        try {
            const [updatedVendor] = await db
                .update(quickbooksVendorsModel)
                .set({
                    ...updateData,
                    updatedAt: new Date(),
                })
                .where(eq(quickbooksVendorsModel.id, vendorId))
                .returning();

            return updatedVendor;
        } catch (error) {
            console.error('Error updating vendor:', error);
            throw error;
        }
    }
}

export const vendorsService = new VendorsService();
