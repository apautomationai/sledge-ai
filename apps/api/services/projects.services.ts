import db from "@/lib/db";
import { projectsModel } from "@/models/projects.model";
import { quickbooksVendorsModel } from "@/models/quickbooks-vendors.model";
import { projectVendorsModel } from "@/models/project-vendors.model";
import { invoiceModel } from "@/models/invoice.model";
import { googleMapsService } from "@/services/google-maps.service";
import { eq, and, or, ilike, sql, count, asc, desc } from "drizzle-orm";

class ProjectsServices {
    // Fallback image URL for projects without images
    private readonly FALLBACK_IMAGE_URL = '/images/project-placeholder.svg'; // Professional project placeholder image

    /**
     * Get image URL with fallback
     */
    private getImageUrlWithFallback(imageUrl: string | null): string {
        return imageUrl || this.FALLBACK_IMAGE_URL;
    }

    /**
     * Fetch and update project coordinates if they're null
     */
    private async fetchAndUpdateProjectCoordinates(project: any): Promise<{ latitude: string | null, longitude: string | null }> {
        if (project.latitude && project.longitude) {
            return { latitude: project.latitude, longitude: project.longitude }; // Already has coordinates
        }

        try {
            const fullAddress = `${project.address}, ${project.city}, ${project.state} ${project.postalCode}`.trim();
            const geocodeResult = await googleMapsService.geocodeAddress(fullAddress);

            if (geocodeResult) {
                const latitude = geocodeResult.latitude.toString();
                const longitude = geocodeResult.longitude.toString();

                // Update the project with the new coordinates
                await db
                    .update(projectsModel)
                    .set({
                        latitude: latitude,
                        longitude: longitude,
                        updatedAt: new Date()
                    })
                    .where(eq(projectsModel.id, project.id));

                console.log(`✅ Updated coordinates for project ${project.id}: ${project.name} (${latitude}, ${longitude})`);
                return { latitude, longitude };
            } else {
                console.log(`⚠️ No coordinates found for project ${project.id}: ${project.name}`);
                return { latitude: null, longitude: null };
            }
        } catch (error) {
            console.error(`❌ Error fetching coordinates for project ${project.id}:`, error);
            return { latitude: null, longitude: null };
        }
    }

    /**
     * Fetch and update project image if it's null
     */
    private async fetchAndUpdateProjectImage(project: any): Promise<string | null> {
        if (project.imageUrl) {
            return project.imageUrl; // Already has an image
        }

        try {
            const imageUrl = await googleMapsService.getImageUrlForAddress(project.address);

            if (imageUrl) {
                // Update the project with the new image URL
                await db
                    .update(projectsModel)
                    .set({
                        imageUrl: imageUrl,
                        updatedAt: new Date()
                    })
                    .where(eq(projectsModel.id, project.id));

                console.log(`✅ Updated image for project ${project.id}: ${project.name}`);
                return imageUrl;
            } else {
                // No image found, but don't update the database to avoid repeated API calls
                console.log(`⚠️ No image found for project ${project.id}: ${project.name}`);
                return null;
            }
        } catch (error) {
            console.error(`❌ Error fetching image for project ${project.id}:`, error);
            return null;
        }
    }
    async getProjects(userId: number, page: number = 1, limit: number = 10, search: string = "", sortBy: string = "createdAt", sortOrder: string = "desc") {
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

        // Determine sort column and direction
        let orderByClause;
        const sortColumn = sortBy === "name" ? projectsModel.name : projectsModel.createdAt;

        if (sortOrder === "asc") {
            orderByClause = asc(sortColumn);
        } else {
            orderByClause = desc(sortColumn);
        }

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
                latitude: projectsModel.latitude,
                longitude: projectsModel.longitude,
                billingCycle: projectsModel.billingCycle,
                createdAt: projectsModel.createdAt,
                updatedAt: projectsModel.updatedAt,
            })
            .from(projectsModel)
            .where(whereConditions)
            .orderBy(orderByClause)
            .limit(limit)
            .offset(offset);

        // Get vendor counts and fetch images for each project
        const projectsWithVendorCount = await Promise.all(
            projects.map(async (project) => {
                const [{ vendorCount }] = await db
                    .select({ vendorCount: count() })
                    .from(projectVendorsModel)
                    .where(
                        and(
                            eq(projectVendorsModel.projectId, project.id),
                            eq(projectVendorsModel.isDeleted, false)
                        )
                    );

                // Fetch image if null (but don't wait for it to avoid slowing down the response)
                let imageUrl = project.imageUrl;
                if (!imageUrl) {
                    // Run image fetching in background without awaiting - use setImmediate to ensure it's truly async
                    setImmediate(() => {
                        this.fetchAndUpdateProjectImage(project).catch(error => {
                            console.error(`Background image fetch failed for project ${project.id}:`, error);
                        });
                    });
                }

                // Fetch coordinates if null (but don't wait for it to avoid slowing down the response)
                let { latitude, longitude } = project;
                if (!latitude || !longitude) {
                    // Run coordinate fetching in background without awaiting
                    setImmediate(() => {
                        this.fetchAndUpdateProjectCoordinates(project).catch(error => {
                            console.error(`Background coordinate fetch failed for project ${project.id}:`, error);
                        });
                    });
                }

                return {
                    ...project,
                    vendorCount: Number(vendorCount),
                    imageUrl: this.getImageUrlWithFallback(imageUrl),
                    latitude: latitude || null,
                    longitude: longitude || null,
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

        // Get vendors for this project using the junction table
        const projectVendorRelations = await db
            .select({
                // Project-vendor relationship data
                relationId: projectVendorsModel.id,
                totalInvoiced: projectVendorsModel.totalInvoiced,
                invoiceCount: projectVendorsModel.invoiceCount,
                firstInvoiceDate: projectVendorsModel.firstInvoiceDate,
                lastInvoiceDate: projectVendorsModel.lastInvoiceDate,
                // Vendor data
                vendorId: quickbooksVendorsModel.id,
                displayName: quickbooksVendorsModel.displayName,
                companyName: quickbooksVendorsModel.companyName,
                primaryEmail: quickbooksVendorsModel.primaryEmail,
                primaryPhone: quickbooksVendorsModel.primaryPhone,
                billAddrLine1: quickbooksVendorsModel.billAddrLine1,
                billAddrCity: quickbooksVendorsModel.billAddrCity,
                billAddrState: quickbooksVendorsModel.billAddrState,
                billAddrPostalCode: quickbooksVendorsModel.billAddrPostalCode,
            })
            .from(projectVendorsModel)
            .leftJoin(quickbooksVendorsModel, eq(projectVendorsModel.vendorId, quickbooksVendorsModel.id))
            .where(
                and(
                    eq(projectVendorsModel.projectId, projectId),
                    eq(projectVendorsModel.isDeleted, false)
                )
            );

        // Get invoices for each vendor
        const vendorsWithInvoices = await Promise.all(
            projectVendorRelations.map(async (relation) => {
                // Get invoices for this vendor at this project location
                const invoices = await db
                    .select()
                    .from(invoiceModel)
                    .where(
                        and(
                            eq(invoiceModel.userId, userId),
                            relation.vendorId ? eq(invoiceModel.vendorId, relation.vendorId) : sql`1=1`,
                            eq(invoiceModel.deliveryAddress, project.address),
                            eq(invoiceModel.isDeleted, false)
                        )
                    )
                    .orderBy(sql`${invoiceModel.invoiceDate} DESC`);

                return {
                    // Vendor information
                    id: relation.vendorId,
                    displayName: relation.displayName,
                    companyName: relation.companyName,
                    primaryEmail: relation.primaryEmail,
                    primaryPhone: relation.primaryPhone,
                    billAddrLine1: relation.billAddrLine1,
                    billAddrCity: relation.billAddrCity,
                    billAddrState: relation.billAddrState,
                    billAddrPostalCode: relation.billAddrPostalCode,
                    // Aggregated data from junction table
                    totalInvoiced: parseFloat(relation.totalInvoiced || '0'),
                    invoiceCount: relation.invoiceCount || 0,
                    firstInvoiceDate: relation.firstInvoiceDate,
                    lastInvoiceDate: relation.lastInvoiceDate,
                    // Invoice details
                    invoices,
                };
            })
        );

        // Fetch image if null (but don't wait for it to avoid slowing down the response)
        let imageUrl = project.imageUrl;
        if (!imageUrl) {
            // Run image fetching in background without awaiting - use setImmediate to ensure it's truly async
            setImmediate(() => {
                this.fetchAndUpdateProjectImage(project).catch(error => {
                    console.error(`Background image fetch failed for project ${project.id}:`, error);
                });
            });
        }

        // Fetch coordinates if null (but don't wait for it to avoid slowing down the response)
        let { latitude, longitude } = project;
        if (!latitude || !longitude) {
            // Run coordinate fetching in background without awaiting
            setImmediate(() => {
                this.fetchAndUpdateProjectCoordinates(project).catch(error => {
                    console.error(`Background coordinate fetch failed for project ${project.id}:`, error);
                });
            });
        }

        return {
            ...project,
            imageUrl: this.getImageUrlWithFallback(imageUrl),
            latitude: latitude || null,
            longitude: longitude || null,
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
                latitude: projectsModel.latitude,
                longitude: projectsModel.longitude,
            })
            .from(projectsModel)
            .where(
                and(
                    eq(projectsModel.userId, userId),
                    eq(projectsModel.isDeleted, false)
                )
            );

        // Fetch images and coordinates for projects that don't have them (background process)
        const projectsWithFallback = projects.map(project => {
            if (!project.imageUrl) {
                // Run image fetching in background without awaiting - use setImmediate to ensure it's truly async
                setImmediate(() => {
                    this.fetchAndUpdateProjectImage(project).catch(error => {
                        console.error(`Background image fetch failed for project ${project.id}:`, error);
                    });
                });
            }

            if (!project.latitude || !project.longitude) {
                // Run coordinate fetching in background without awaiting
                setImmediate(() => {
                    this.fetchAndUpdateProjectCoordinates(project).catch(error => {
                        console.error(`Background coordinate fetch failed for project ${project.id}:`, error);
                    });
                });
            }

            return {
                ...project,
                imageUrl: this.getImageUrlWithFallback(project.imageUrl),
                latitude: project.latitude || null,
                longitude: project.longitude || null,
            };
        });

        return projectsWithFallback;
    }
}

export const projectsServices = new ProjectsServices();
