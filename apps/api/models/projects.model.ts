import { relations } from "drizzle-orm";
import {
    integer,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    boolean,
} from "drizzle-orm/pg-core";
import { usersModel } from "./users.model";
import { quickbooksVendorsModel } from "./quickbooks-vendors.model";

export const projectsModel = pgTable("projects", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersModel.id),

    // Project details
    name: varchar("name", { length: 255 }).notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 50 }),
    postalCode: varchar("postal_code", { length: 20 }),
    country: varchar("country", { length: 50 }),
    imageUrl: text("image_url"),

    // Billing cycle information
    billingCycle: integer("billing_cycle").notNull().default(30), // days
    totalBillingCycles: integer("total_billing_cycles").notNull().default(1),
    currentBillingCycle: integer("current_billing_cycle").notNull().default(1),

    // Soft delete
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectsRelations = relations(projectsModel, ({ one, many }) => ({
    user: one(usersModel, {
        fields: [projectsModel.userId],
        references: [usersModel.id],
    }),
    vendors: many(quickbooksVendorsModel),
}));
