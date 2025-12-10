import db from "@/lib/db";
import { projectsModel } from "@/models/projects.model";
import { quickbooksVendorsModel } from "@/models/quickbooks-vendors.model";
import { invoiceModel } from "@/models/invoice.model";
import { eq, and, or, ilike, sql, count } from "drizzle-orm";

class ProjectsServices {
    async getProjects(userId: number, page: number = 1, limit: number = 10, search: string = "") {
        const offset = (page - 1) * limit;

        // Build where conditions - only non-deleted projects
        let whereConditions = and(
            eq(projectsModel.userId, userId),
            eq(projectsModel.isDeleted, false)
        ) as any;

        // Add search filter if provided (case-insensitive)
        if (search && search.trim() !== "") {
            const searchPattern = `%${search}%`;
            whereConditions = and(
                whereConditions,
                or(
                    ilike(projectsModel.name, searchPattern),
                    ilike(projectsModel.address, searchPattern),
                    ilike(projectsModel.city, searchPattern),
                    ilike(projectsModel.state, searchPattern)
                )
            ) as any;
        }

        // Get total count
        const [{ total }] = await db
            .select({ total: count() })
            .from(projectsModel)
            .where(whereConditions);

        // Get projects with pagination
        const projects = await db
            .select({
                id: projectsModel.id,
                name: projectsModel.name,
                address: projectsModel.address,
                city: projectsModel.city,
                state: projectsModel.state,
                postalCode: projectsModel.postalCode,
                country: projectsModel.country,
                imageUrl: projectsModel.imageUrl,
                billingCycle: projectsModel.billingCycle,
                totalBillingCycles: projectsModel.totalBillingCycles,
                currentBillingCycle: projectsModel.currentBillingCycle,
                createdAt: projectsModel.createdAt,
                updatedAt: projectsModel.updatedAt,
            })
            .from(projectsModel)
            .where(whereConditions)
            .orderBy(projectsModel.createdAt)
            .limit(limit)
            .offset(offset);

        // Get vendor counts for each project
        const projectsWithVendorCount = await Promise.all(
            projects.map(async (project) => {
                const [{ vendorCount }] = await db
                    .select({ vendorCount: count() })
                    .from(quickbooksVendorsModel)
                    .where(eq(quickbooksVendorsModel.projectId, project.id));

                return {
                    ...project,
                    vendorCount: Number(vendorCount),
                };
            })
        );

        return {
            projects: projectsWithVendorCount,
            pagination: {
                total: Number(total),
                page,
                limit,
                totalPages: Math.ceil(Number(total) / limit),
            },
        };
    }

    async getProjectById(projectId: number, userId: number) {
        const [project] = await db
            .select()
            .from(projectsModel)
            .where(
                and(
                    eq(projectsModel.id, projectId),
                    eq(projectsModel.userId, userId),
                    eq(projectsModel.isDeleted, false)
                )
            )
            .limit(1);

        if (!project) {
            return null;
        }

        // Get vendors for this project
        const vendors = await db
            .select()
            .from(quickbooksVendorsModel)
            .where(eq(quickbooksVendorsModel.projectId, projectId));

        // Get invoices for each vendor with aggregated data
        const vendorsWithInvoices = await Promise.all(
            vendors.map(async (vendor) => {
                const vendorName = vendor.displayName || vendor.companyName;

                if (!vendorName) {
                    return {
                        ...vendor,
                        invoices: [],
                        totalInvoiced: 0,
                        invoiceCount: 0,
                        lastInvoiceDate: null,
                    };
                }

                // Get all invoices for this vendor (non-deleted)
                const invoices = await db
                    .select()
                    .from(invoiceModel)
                    .where(
                        and(
                            eq(invoiceModel.userId, userId),
                            eq(invoiceModel.vendorName, vendorName),
                            eq(invoiceModel.isDeleted, false)
                        )
                    )
                    .orderBy(sql`${invoiceModel.invoiceDate} DESC`);

                // Calculate aggregated data
                const totalInvoiced = invoices.reduce((sum, inv) => {
                    return sum + (inv.totalAmount ? parseFloat(inv.totalAmount.toString()) : 0);
                }, 0);

                const lastInvoiceDate = invoices.length > 0 ? invoices[0].invoiceDate : null;

                return {
                    ...vendor,
                    invoices,
                    totalInvoiced,
                    invoiceCount: invoices.length,
                    lastInvoiceDate,
                };
            })
        );

        return {
            ...project,
            vendors: vendorsWithInvoices,
        };
    }

    async deleteProject(projectId: number, userId: number) {
        // Soft delete - set isDeleted to true and deletedAt timestamp
        const [deletedProject] = await db
            .update(projectsModel)
            .set({
                isDeleted: true,
                deletedAt: new Date(),
            })
            .where(
                and(
                    eq(projectsModel.id, projectId),
                    eq(projectsModel.userId, userId),
                    eq(projectsModel.isDeleted, false)
                )
            )
            .returning();

        return deletedProject;
    }

    async getAllProjectsForMap(userId: number) {
        // Get all non-deleted projects for map display (no pagination)
        const projects = await db
            .select({
                id: projectsModel.id,
                name: projectsModel.name,
                address: projectsModel.address,
                city: projectsModel.city,
                state: projectsModel.state,
                imageUrl: projectsModel.imageUrl,
            })
            .from(projectsModel)
            .where(
                and(
                    eq(projectsModel.userId, userId),
                    eq(projectsModel.isDeleted, false)
                )
            );

        return projects;
    }
}

export const projectsServices = new ProjectsServices();
