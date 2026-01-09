import { BadRequestError, NotFoundError } from "@/helpers/errors";
import db from "@/lib/db";
import { integrationsModel } from "@/models/integrations.model";
import { and, eq, ne } from "drizzle-orm";
interface UpdatedData {
  name: "google";
  status: "pending" | "approved" | "rejected" | "failed" | "not_connected";
}

class IntegrationsService {
  async insertIntegration(data: any) {
    try {
      const [response] = await db
        .insert(integrationsModel)
        .values(data)
        .returning();
      const result = {
        success: true,
        data: response,
      };

      return result;
    } catch (error: any) {
      const result = {
        success: false,
        message: error.message,
      };
      return result;
    }
  }

  async updateIntegration(id: number, data: any) {
    try {
      data.updatedAt = new Date();
      const updatedData = await db
        .update(integrationsModel)
        .set(data)
        .where(eq(integrationsModel.id, id))
        .returning();

      const result = {
        success: true,
        data: updatedData,
      };

      return result;
    } catch (error: any) {
      const result = {
        success: false,
        message: error.message,
      };
      return result;
    }
  }

  async getGmailIntegration() {
    try {
      const integrations = await db
        .select()
        .from(integrationsModel)
        .where(and(eq(integrationsModel.name, "gmail"), eq(integrationsModel.status, "success")));
      return {
        success: true,
        data: integrations || [],
      };
    }
    catch (error: any) {
      const result = {
        success: false,
        message: error.message,
      };
      return result;
    }
  }

  async getOutlookIntegration() {
    try {
      const integrations = await db
        .select()
        .from(integrationsModel)
        .where(and(eq(integrationsModel.name, "outlook"), eq(integrationsModel.status, "success")));
      return {
        success: true,
        data: integrations || [],
      };
    }
    catch (error: any) {
      const result = {
        success: false,
        message: error.message,
      };
      return result;
    }
  }

  async getIntegrations(useId: number) {
    try {
      // @ts-ignore
      const integrations = await db
        .select()
        .from(integrationsModel)
        .where(eq(integrationsModel.userId, useId));
      const result = {
        success: true,
        data: integrations,
      };
      return result;
    } catch (error: any) {
      const result = {
        success: false,
        message: error.message,
      };
      return result;
    }
  }

  async getAllIntegration() {
    try {
      const allIntegrations = await db.select().from(integrationsModel);
      const result = {
        success: true,
        data: allIntegrations,
      };
      return result;
    } catch (error: any) {
      const result = {
        success: false,
        message: error.message,
      };
      return result;
    }
  }

  async getIntegrationById(id: number) {
    try {
      const [integration] = await db
        .select()
        .from(integrationsModel)
        .where(eq(integrationsModel.id, id));
      return integration || null;
    } catch (error: any) {
      return null;
    }
  }

  async checkIntegration(userId: number, name: string) {
    // check if this integration exists for the user

    try {
      const [integration] = await db
        .select()
        .from(integrationsModel)
        .where(
          and(
            eq(integrationsModel.userId, userId),
            eq(integrationsModel.name, name),
            eq(integrationsModel.status, "success")
          )
        );
      return integration;
    } catch (error: any) {
      return false;
    }
  }

  async checkEmailExists(email: string, excludeUserId?: number): Promise<boolean> {
    try {
      const conditions = [eq(integrationsModel.email, email)];
      if (excludeUserId) {
        conditions.push(ne(integrationsModel.userId, excludeUserId));
      }
      const [integration] = await db
        .select()
        .from(integrationsModel)
        .where(and(...conditions))
        .limit(1);
      return !!integration;
    } catch (error: any) {
      return false;
    }
  }

  async getIntegrationByEmail(email: string) {
    try {
      const [integration] = await db
        .select()
        .from(integrationsModel)
        .where(eq(integrationsModel.email, email))
        .limit(1);
      return integration || null;
    } catch (error: any) {
      return null;
    }
  }
  updateStatus = async (userId: number, updatedData: UpdatedData) => {
    try {
      const [integration] = await db
        .select()
        .from(integrationsModel)
        .where(
          and(
            eq(integrationsModel.userId, userId),
            eq(integrationsModel.name, updatedData.name)
          )
        );
      if (!integration) {
        throw new NotFoundError("No integration found");
      }
      const response = await db
        .update(integrationsModel)
        //@ts-ignore
        .set({ status: updatedData.status as any, updatedAt: new Date() })
        .where(
          and(
            eq(integrationsModel.userId, userId),
            eq(integrationsModel.name, updatedData.name)
          )
        )
        .returning();
      if (response.length === 0) {
        throw new BadRequestError("Unable to update status");
      }
      return response;
    } catch (error: any) {
      throw new NotFoundError(error.message || "Unable to update status");
    }
  };
  getStartedReadingAt = async (userId: number, name: string) => {
    try {
      const [integration] = await db
        .select()
        .from(integrationsModel)
        .where(
          and(
            eq(integrationsModel.userId, userId),
            eq(integrationsModel.name, name)
          )
        );

      if (!integration) {
        return null;
      }

      const metadata = (integration.metadata as any) || {};
      return metadata.startReading ? new Date(metadata.startReading) : null;
    } catch (error: any) {
      const result = {
        status: false,
        data: error.message,
      };
      return result;
    }
  };
  getLastReadAt = async (userId: number, name: string) => {
    try {
      const [integration] = await db
        .select()
        .from(integrationsModel)
        .where(
          and(
            eq(integrationsModel.userId, userId),
            eq(integrationsModel.name, name)
          )
        );

      if (!integration) {
        return null;
      }

      const metadata = (integration.metadata as any) || {};
      return metadata.lastRead ? new Date(metadata.lastRead) : null;
    } catch (error: any) {
      const result = {
        status: false,
        data: error.message,
      };
      return result;
    }
  };

  async deleteIntegration(userId: number, name: string) {
    try {
      const integrations = await this.getIntegrations(userId);

      //@ts-ignore
      const integration = integrations?.data?.find(
        (int: any) => int.name === name
      );
      if (!integration) {
        throw new NotFoundError(`No ${name} integration found for this user`);
      }
      const [deleted] = await db
        .delete(integrationsModel)
        //@ts-ignore
        .where(eq(integrationsModel.id, integration.id))
        .returning();

      if (!deleted) {
        return {
          success: false,
          error: `No ${name} integration found for this user`,
        };
      }
      return {
        success: true,
        data: { message: `Successfully deleted ${name} integration ` },
      };
    } catch (error: any) {
      const result = {
        success: false,
        message: error.message,
      };
      return result;
    }
  }

  async updateStartReading(userId: number, name: string, startReading: string) {
    try {
      console.log("startReading from service", startReading);
      const timestamp = new Date(startReading);
      const integrations = await this.getIntegrations(userId);
      //@ts-ignore
      const integration = integrations?.data?.find(
        (int: any) => int.name === name
      );
      if (!integration) {
        throw new NotFoundError(`No ${name} integration found for this user`);
      }
      
      const currentMetadata = (integration.metadata as any) || {};
      const updatedMetadata = {
        ...currentMetadata,
        startReading: timestamp.toISOString(),
      };
      console.log("updatedMetadata", updatedMetadata);
      console.log("integration", integration);

      const [updateStartTime] = await db
        .update(integrationsModel)
        .set({ metadata: updatedMetadata })
        .where(eq(integrationsModel.id, integration.id))
        .returning();
      const result = {
        success: true,
        data: updateStartTime,
      };
      return result;
    } catch (error: any) {
      const result = {
        status: false,
        message: error.message,
      };
      return result;
    }
  }
}

export const integrationsService = new IntegrationsService();
