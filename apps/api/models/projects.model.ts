import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { usersModel } from "./users.model";

export const projectsModel = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 50 }),
  imageUrl: text("image_url"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  billingCycle: integer("billing_cycle").default(30).notNull(), 
  latitude: numeric("latitude", { precision: 10, scale: 8 }), 
  longitude: numeric("longitude", { precision: 11, scale: 8 }), 
});

export const projectsRelations = relations(projectsModel, ({ one }) => ({
  user: one(usersModel, {
    fields: [projectsModel.userId],
    references: [usersModel.id],
  }),
}));
