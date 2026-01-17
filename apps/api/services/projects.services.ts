import db from "@/lib/db";
import { projectsModel } from "@/models/projects.model";
import { quickbooksVendorsModel } from "@/models/quickbooks-vendors.model";
import { projectVendorsModel } from "@/models/project-vendors.model";
import { invoiceModel } from "@/models/invoice.model";
import { googleMapsService } from "@/services/google-maps.service";
import { eq, and, or, ilike, sql, count, asc, desc } from "drizzle-orm";

class ProjectsServices {
    // Fallback image URL for projects without images
    private readonly FALLBACK_IMAGE_URL = '/images/project-placeholder.jpg'; // Professional project placeholder image

    /**
     * Create a new project with vendors and invoices
     */
    async createProject(
        projectData: typeof projectsModel.$inferInsert,
        vendorIds: number[]
    ) {
        return await db.transaction(async (tx) => {
            // Create the project
            const [project] = await tx
                .insert(projectsModel)
                .values(projectData)
                .returning();

            // Create project-vendor relationships
            if (vendorIds.length > 0) {
                const projectVendorRecords = vendorIds.map(vendorId => ({
                    projectId: project.id,
                    vendorId: vendorId,
                }));

                await tx.insert(projectVendorsModel).values(projectVendorRecords);
            }

            return project;
        });
    }

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
                return { latitude, longitude };
            } else {
                return { latitude: null, longitude: null };
            }
        } catch (error) {
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

                return imageUrl;
            } else {
                // No image found, but don't update the database to avoid repeated API calls
                return null;
            }
        } catch (error) {
            console.error(`❌ [IMAGE] Error fetching image for project ${project.id}:`, error);
            return null;
        }
    }
    async getProjects(userId: number, page: number = 1, limit: number = 10, search: string = "", sortBy: string = "createdAt", sortOrder: string = "desc", bounds?: { north: number, south: number, east: number, west: number }) {
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

        // Add geographic bounds filter if provided
        if (bounds) {
            whereConditions = and(
                whereConditions,
                // Only include projects that have coordinates
                sql`${projectsModel.latitude} IS NOT NULL`,
                sql`${projectsModel.longitude} IS NOT NULL`,
                // Latitude bounds
                sql`CAST(${projectsModel.latitude} AS DECIMAL) >= ${bounds.south}`,
                sql`CAST(${projectsModel.latitude} AS DECIMAL) <= ${bounds.north}`,
                // Longitude bounds
                sql`CAST(${projectsModel.longitude} AS DECIMAL) >= ${bounds.west}`,
                sql`CAST(${projectsModel.longitude} AS DECIMAL) <= ${bounds.east}`
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
                billingCycleStartDate: projectsModel.billingCycleStartDate,
                billingCycleEndDate: projectsModel.billingCycleEndDate,
                status: projectsModel.status,
                projectStartDate: projectsModel.projectStartDate,
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
                            console.error(`❌ [BACKGROUND] Background image fetch failed for project ${project.id}:`, error);
                        });
                    });
                }

                // Fetch coordinates if null (but don't wait for it to avoid slowing down the response)
                let { latitude, longitude } = project;
                if (!latitude || !longitude) {
                    // Run coordinate fetching in background without awaiting
                    setImmediate(() => {
                        this.fetchAndUpdateProjectCoordinates(project)
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



    /**
     * Get all available billing cycles for a project based on billing cycle dates and invoice dates
     */
    private async getAvailableBillingCycles(projectId: number, userId: number, billingCycleStartDate: Date | null, billingCycleEndDate: Date | null, projectStartDate: Date | null) {
        if (!billingCycleStartDate || !billingCycleEndDate) {
            return [];
        }

        // Get the earliest and latest invoice dates for this project (after project start date)
        const invoiceDateRange = await db
            .select({
                earliestDate: sql<string>`MIN(${invoiceModel.invoiceDate})`,
                latestDate: sql<string>`MAX(${invoiceModel.invoiceDate})`
            })
            .from(invoiceModel)
            .leftJoin(projectVendorsModel, eq(invoiceModel.vendorId, projectVendorsModel.vendorId))
            .where(
                and(
                    eq(invoiceModel.userId, userId),
                    eq(projectVendorsModel.projectId, projectId),
                    eq(invoiceModel.isDeleted, false),
                    eq(projectVendorsModel.isDeleted, false),
                    // Only include invoices after project start date
                    projectStartDate ? sql`${invoiceModel.invoiceDate} >= ${projectStartDate.toISOString().split('T')[0]}` : undefined
                )
            );

        const { earliestDate, latestDate } = invoiceDateRange[0];

        if (!earliestDate || !latestDate) {
            return [];
        }

        const cycles = [];
        const now = new Date();

        // Extract the day of month from the billing cycle dates to determine the pattern
        const cycleEndDay = billingCycleEndDate.getDate();

        // Calculate the cycle length in days
        const cycleLengthMs = billingCycleEndDate.getTime() - billingCycleStartDate.getTime();
        const cycleLengthDays = Math.ceil(cycleLengthMs / (1000 * 60 * 60 * 24));

        // Find the current billing cycle end date based on the pattern
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        let currentCycleEnd = new Date(currentYear, currentMonth, cycleEndDay);

        // If today is past the billing cycle end day, the current cycle ends next month
        if (now.getDate() > cycleEndDay) {
            currentCycleEnd = new Date(currentYear, currentMonth + 1, cycleEndDay);
        }

        // Generate cycles going backwards from current cycle to earliest invoice
        let cycleEnd = new Date(currentCycleEnd);
        const earliestInvoiceDate = new Date(earliestDate);

        while (cycleEnd >= earliestInvoiceDate) {
            // Calculate cycle start based on the pattern
            const cycleStart = new Date(cycleEnd);
            cycleStart.setDate(cycleStart.getDate() - cycleLengthDays + 1);

            // Check if this is the current cycle
            const isCurrent = now >= cycleStart && now <= cycleEnd;

            // Create cycle label
            const startLabel = cycleStart.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: cycleStart.getFullYear() !== cycleEnd.getFullYear() ? 'numeric' : undefined
            });
            const endLabel = cycleEnd.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });

            cycles.push({
                id: `${cycleEnd.getFullYear()}-${String(cycleEnd.getMonth() + 1).padStart(2, '0')}-${String(cycleEnd.getDate()).padStart(2, '0')}`,
                label: `${startLabel} - ${endLabel}`,
                startDate: cycleStart,
                endDate: cycleEnd,
                isCurrent: isCurrent
            });

            // Move to previous cycle
            cycleEnd = new Date(cycleStart);
            cycleEnd.setDate(cycleEnd.getDate() - 1);
        }

        return cycles; // Already in reverse chronological order (most recent first)
    }



    /**
     * Filter invoices by billing cycle
     */
    private filterInvoicesByBillingCycle(invoices: any[], cycleStart: Date, cycleEnd: Date) {
        return invoices.filter(invoice => {
            if (!invoice.invoiceDate) return false;
            const invoiceDate = new Date(invoice.invoiceDate);
            return invoiceDate >= cycleStart && invoiceDate <= cycleEnd;
        });
    }

    async getProjectById(projectId: number, userId: number, billingCycle?: string) {
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

        // Get available billing cycles
        const availableCycles = await this.getAvailableBillingCycles(
            projectId,
            userId,
            project.billingCycleStartDate,
            project.billingCycleEndDate,
            project.projectStartDate
        );

        // Determine which billing cycle to show
        let selectedCycle = null;
        let cycleStart: Date | null = null;
        let cycleEnd: Date | null = null;

        if (availableCycles.length === 0) {
            // No billing cycles available (project not activated or no invoices)
            selectedCycle = 'full';
        } else if (billingCycle === 'full' || !billingCycle) {
            // Show all invoices (no filtering)
            selectedCycle = 'full';
        } else if (billingCycle === 'current') {
            // Show current billing cycle
            const currentCycle = availableCycles.find(cycle => cycle.isCurrent);
            if (currentCycle) {
                selectedCycle = currentCycle.id;
                cycleStart = currentCycle.startDate;
                cycleEnd = currentCycle.endDate;
            } else {
                // No current cycle found, default to full
                selectedCycle = 'full';
            }
        } else {
            // Show specific billing cycle
            const specificCycle = availableCycles.find(cycle => cycle.id === billingCycle);
            if (specificCycle) {
                selectedCycle = specificCycle.id;
                cycleStart = specificCycle.startDate;
                cycleEnd = specificCycle.endDate;
            } else {
                // Specific cycle not found, default to full
                selectedCycle = 'full';
            }
        }

        // Get invoices for each vendor
        const vendorsWithInvoices = await Promise.all(
            projectVendorRelations.map(async (relation) => {
                // Get all invoices for this vendor at this project location (after project start date)
                const allInvoices = await db
                    .select()
                    .from(invoiceModel)
                    .where(
                        and(
                            eq(invoiceModel.userId, userId),
                            relation.vendorId ? eq(invoiceModel.vendorId, relation.vendorId) : sql`1=1`,
                            eq(invoiceModel.deliveryAddress, project.address),
                            eq(invoiceModel.isDeleted, false),
                            // Only include invoices after project start date
                            project.projectStartDate ? sql`${invoiceModel.invoiceDate} >= ${project.projectStartDate.toISOString().split('T')[0]}` : undefined
                        )
                    )
                    .orderBy(sql`${invoiceModel.invoiceDate} DESC`);

                // Filter invoices by billing cycle if specified
                let filteredInvoices = allInvoices;
                if (cycleStart && cycleEnd) {
                    filteredInvoices = this.filterInvoicesByBillingCycle(allInvoices, cycleStart, cycleEnd);
                }

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
                    // Calculate aggregated data from filtered invoices
                    totalInvoiced: filteredInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || '0'), 0),
                    invoiceCount: filteredInvoices.length,
                    firstInvoiceDate: filteredInvoices.length > 0 ? filteredInvoices[filteredInvoices.length - 1]?.invoiceDate : null,
                    lastInvoiceDate: filteredInvoices.length > 0 ? filteredInvoices[0]?.invoiceDate : null,
                    invoices: filteredInvoices,
                    totalInvoicesAllTime: allInvoices.length,
                    totalAmountAllTime: allInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || '0'), 0),
                };
            })
        );

        // Fetch image if null (but don't wait for it to avoid slowing down the response)
        let imageUrl = project.imageUrl;
        if (!imageUrl) {
            // Run image fetching in background without awaiting - use setImmediate to ensure it's truly async
            setImmediate(() => {
                this.fetchAndUpdateProjectImage(project).catch(error => {
                    console.error(`❌ [DETAIL BACKGROUND] Background image fetch failed for project ${project.id}:`, error);
                });
            });
        }

        // Fetch coordinates if null (but don't wait for it to avoid slowing down the response)
        let { latitude, longitude } = project;
        if (!latitude || !longitude) {
            // Run coordinate fetching in background without awaiting
            setImmediate(() => {
                this.fetchAndUpdateProjectCoordinates(project).catch(error => {
                    console.error(`❌ [DETAIL BACKGROUND] Background coordinate fetch failed for project ${project.id}:`, error);
                });
            });
        }

        return {
            ...project,
            imageUrl: this.getImageUrlWithFallback(imageUrl),
            latitude: latitude || null,
            longitude: longitude || null,
            vendors: vendorsWithInvoices,
            billingCycles: {
                available: availableCycles,
                selected: selectedCycle,
                selectedCycleInfo: selectedCycle !== 'full' && cycleStart && cycleEnd ? {
                    startDate: cycleStart,
                    endDate: cycleEnd,
                    label: availableCycles.find(c => c.id === selectedCycle)?.label || ''
                } : null
            }
        };
    }

    async updateProject(projectId: number, userId: number, updateData: {
        status?: string;
        projectStartDate?: Date;
        name?: string;
        address?: string;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;

        billingCycleStartDate?: Date;
        billingCycleEndDate?: Date;
    }) {
        const [updatedProject] = await db
            .update(projectsModel)
            .set({
                ...updateData,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(projectsModel.id, projectId),
                    eq(projectsModel.userId, userId),
                    eq(projectsModel.isDeleted, false)
                )
            )
            .returning();

        return updatedProject;
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
                status: projectsModel.status,
                projectStartDate: projectsModel.projectStartDate,
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
                        console.error(`❌ [MAP BACKGROUND] Background image fetch failed for project ${project.id}:`, error);
                    });
                });
            }

            if (!project.latitude || !project.longitude) {
                // Run coordinate fetching in background without awaiting
                setImmediate(() => {
                    this.fetchAndUpdateProjectCoordinates(project).catch(error => {
                        console.error(`❌ [MAP BACKGROUND] Background coordinate fetch failed for project ${project.id}:`, error);
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

    async findVendorByName(name: string) {
        const search = `%${name.toLowerCase()}%`;

        const [vendor] = await db
            .select({
                id: quickbooksVendorsModel.id,
                displayName: quickbooksVendorsModel.displayName,
                companyName: quickbooksVendorsModel.companyName,
                givenName: quickbooksVendorsModel.givenName,
                middleName: quickbooksVendorsModel.middleName,
                familyName: quickbooksVendorsModel.familyName,
            })
            .from(quickbooksVendorsModel)
            .where(
                sql`
          lower(${quickbooksVendorsModel.displayName}) LIKE ${search}
          OR lower(${quickbooksVendorsModel.companyName}) LIKE ${search}
          OR lower(${quickbooksVendorsModel.givenName}) LIKE ${search}
          OR lower(${quickbooksVendorsModel.middleName}) LIKE ${search}
          OR lower(${quickbooksVendorsModel.familyName}) LIKE ${search}
        `
            )
            .limit(1);

        return vendor ?? null;
    }

    // Get all projects
    async getAllProjects() {
        const whereConditions = [eq(projectsModel.isDeleted, false)];

        const projects = await db
            .select({
                id: projectsModel.id,
                address: projectsModel.address,
            })
            .from(projectsModel)
            .where(and(...whereConditions));

        const [totalResult] = await db
            .select({ count: count() })
            .from(projectsModel)
            .where(and(...whereConditions));

        return {
            projects,
            totalCount: totalResult.count,
        };
    }

    async createProjectFromAddress(
        userId: number, address: string, vendorName?: string, postal_code?: any, state?: any, country?: any, city?: any) {
        return await db.transaction(async (tx) => {
            const [project] = await tx
                .insert(projectsModel)
                .values({
                    userId,
                    name: address,
                    postalCode: postal_code,
                    city: city,
                    country: country,
                    state: state,
                    address,
                })
                .returning({ id: projectsModel.id });

            let vendor = null;

            if (vendorName) {
                vendor = await this.findVendorByName(vendorName);
            }

            if (vendor) {
                await tx.insert(projectVendorsModel).values({
                    projectId: project.id,
                    vendorId: vendor.id
                });
            }

            return {
                projectId: project.id,
                vendorId: vendor?.id ?? null,
            };
        });
    }
}

export const projectsServices = new ProjectsServices();
