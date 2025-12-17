import db from "@/lib/db";
import { projectVendorsModel } from "@/models/project-vendors.model";
import { quickbooksVendorsModel } from "@/models/quickbooks-vendors.model";
import { projectsModel } from "@/models/projects.model";
import { count, eq, and, sql } from "drizzle-orm";

export class ProjectServices {

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

  // 📦 Get all projects
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
userId: number, address: string, vendorName?: string, postal_code?: any, state?: any, country?: any, city?: any  ) {
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

export const projectServices = new ProjectServices();
