import db from "@/lib/db";
import { sessionsModel } from "@/models/sessions";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

class SessionService {
    async createSession(type: string, data: any) {
        const token = crypto.randomBytes(32).toString("hex"); // 64-char secure token
        // const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(); // 2 hours

        const record = await db
            .insert(sessionsModel)
            .values({
                token,
                type,
                data,
            })
            .returning();

        return record[0];
    }

    async getSession(token: string, type: string) {
        const [session] = await db
            .select()
            .from(sessionsModel)
            .where(and(
                eq(sessionsModel.token, token),
                eq(sessionsModel.type, type),
                eq(sessionsModel.used, false),
            ))
            .limit(1);

        return session;
    }
}

export const sessionService = new SessionService();