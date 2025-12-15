import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { projectsModel } from "./projects.model";
import { quickbooksVendorsModel } from "./quickbooks-vendors.model"; 

export const projectVendorsModel = pgTable("project_vendors", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  vendorId: integer("vendor_id").notNull(),
  totalInvoiced: numeric("total_invoiced"),
  invoiceCount: integer("invoice_count").default(0),
  firstInvoiceDate: timestamp("first_invoice_date"),
  lastInvoiceDate: timestamp("last_invoice_date"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const projectVendorsRelations = relations(projectVendorsModel, ({ one }) => ({
  project: one(projectsModel, {
    fields: [projectVendorsModel.projectId],
    references: [projectsModel.id],
  }),
  vendor: one(quickbooksVendorsModel, {
    fields: [projectVendorsModel.vendorId],
    references: [quickbooksVendorsModel.id],
  }),
}));
