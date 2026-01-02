import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { usersModel } from "./users.model";
import { projectVendorsModel } from "./project-vendors.model";

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

  // Location coordinates
  latitude: decimal("latitude", { precision: 10, scale: 8 }), // High precision for coordinates
  longitude: decimal("longitude", { precision: 11, scale: 8 }), // High precision for coordinates

  // Billing information
  billingCycleStartDate: timestamp("billing_cycle_start_date"), // Billing cycle start
  billingCycleEndDate: timestamp("billing_cycle_end_date"), // Billing cycle end

  // Project status and timeline
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, active, completed, on_hold, cancelled
  projectStartDate: timestamp("project_start_date"),

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
  projectVendors: many(projectVendorsModel),
}));
