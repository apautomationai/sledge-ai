import {
    pgTable,
    text,
    timestamp,
    boolean,
    varchar,
    jsonb,
    uuid,
} from "drizzle-orm/pg-core";

export const sessionsModel = pgTable("sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull().unique(),
    type: varchar("type", { length: 255 }).notNull(),
    data: jsonb().default({}).notNull(),
    expiresAt: timestamp("expires_at", { mode: 'string' }),
    used: boolean("used").default(false),
    createdAt: timestamp("created_at", { mode: 'string' })
    .defaultNow()
    .notNull(),
});
