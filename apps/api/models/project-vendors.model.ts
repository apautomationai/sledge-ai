import { relations } from "drizzle-orm";
import {
    integer,
    pgTable,
    serial,
    timestamp,
    boolean,
    numeric,
} from "drizzle-orm/pg-core";
import { projectsModel } from "./projects.model";
import { quickbooksVendorsModel } from "./quickbooks-vendors.model";

export const projectVendorsModel = pgTable("project_vendors", {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull().references(() => projectsModel.id),
    vendorId: integer("vendor_id").notNull().references(() => quickbooksVendorsModel.id),

    // Aggregated data for this vendor-project relationship
    totalInvoiced: numeric("total_invoiced").default("0"),
    invoiceCount: integer("invoice_count").default(0),
    firstInvoiceDate: timestamp("first_invoice_date"),
    lastInvoiceDate: timestamp("last_invoice_date"),

    // Soft delete
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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