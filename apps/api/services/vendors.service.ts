import db from "@/lib/db";
import { quickbooksVendorsModel } from "@/models/quickbooks-vendors.model";
import { projectVendorsModel } from "@/models/project-vendors.model";
import { projectsModel } from "@/models/projects.model";
import { invoiceModel } from "@/models/invoice.model";
import { lienWaiversModel } from "@/models/lien-waivers.model";
import { eq, and, ilike, count, or } from "drizzle-orm";

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
                            ilike(invoiceModel.vendorName, `%${vendor.displayName || ""}%`)
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
                vendorName: invoiceModel.vendorName,
                customerName: invoiceModel.customerName,
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
                    or(
                        ilike(invoiceModel.vendorName, `%${v.displayName || ""}%`),
                        ilike(invoiceModel.vendorName, `%${v.companyName || ""}%`)
                    )
                )
            );

        // Get lien waivers linked to this vendor
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
            .innerJoin(
                projectsModel,
                eq(lienWaiversModel.projectId, projectsModel.id)
            )
            .where(
                and(
                    eq(projectsModel.userId, userId),
                    or(
                        eq(lienWaiversModel.vendorId, String(vendorId)),
                        ilike(lienWaiversModel.vendorName, `%${v.displayName || ""}%`),
                        ilike(lienWaiversModel.vendorName, `%${v.companyName || ""}%`)
                    )
                )
            );

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
            lienWaivers,
            projectCount: projects.length,
            invoiceCount: invoices.length,
            lienWaiverCount: lienWaivers.length,
            active: v.active,
            balance: v.balance,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
        };
    }
}

export const vendorsService = new VendorsService();
