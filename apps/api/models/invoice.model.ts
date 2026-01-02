import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { usersModel } from "./users.model";
import { attachmentsModel } from "./attachments.model";
import { quickbooksVendorsModel } from "./quickbooks-vendors.model";
import { quickbooksCustomersModel } from "./quickbooks-customers.model";
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "pending",
  "approved",
  "rejected",
  "failed",
  "not_connected"
]);

export const itemTypeEnum = pgEnum("item_type", [
  "account",
  "product"
]);

export const lineItemViewTypeEnum = pgEnum("line_item_view_type", [
  "single",
  "expanded"
]);

export const invoiceModel = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  attachmentId: integer("attachment_id").notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }),
  vendorId: integer("vendor_id"),
  customerId: integer("customer_id"),
  invoiceDate: timestamp("invoice_date"),
  dueDate: timestamp("due_date"),
  totalAmount: numeric("total_amount"),
  totalQuantity: numeric("total_quantity"),
  currency: varchar("currency", { length: 10 }),
  totalTax: numeric("total_tax"),
  description: text("description"),
  fileUrl: text("file_url"),
  fileKey: text("file_key"),
  s3JsonKey: text("s3_json_key"),
  deliveryAddress: text("delivery_address"),
  status: invoiceStatusEnum("status").notNull().default("pending"),
  rejectionEmailSender: varchar("rejection_email_sender", { length: 255 }),
  rejectionReason: text("rejection_reason"),
  isDuplicate: boolean("is_duplicate").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lineItemsModel = pgTable("line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  item_name: text("item_name"),
  description: text("description"),
  quantity: numeric("quantity"),
  rate: numeric("rate"),
  amount: numeric("amount"),
  itemType: itemTypeEnum("item_type"),
  resourceId: varchar("resource_id", { length: 50 }),
  customerId: varchar("customer_id", { length: 50 }),
  viewType: lineItemViewTypeEnum("view_type").notNull().default("expanded"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const lineItemsRelations = relations(lineItemsModel, ({ one }) => ({
  invoice: one(invoiceModel, {
    fields: [lineItemsModel.invoiceId],
    references: [invoiceModel.id],
    relationName: "invoice",
  }),
}));


export const invoiceRelations = relations(invoiceModel, ({ one, many }) => ({
  user: one(usersModel, {
    fields: [invoiceModel.userId],
    references: [usersModel.id],
  }),

  attachment: one(attachmentsModel, {
    fields: [invoiceModel.attachmentId],
    references: [attachmentsModel.id],
  }),

  vendor: one(quickbooksVendorsModel, {
    fields: [invoiceModel.vendorId],
    references: [quickbooksVendorsModel.id],
  }),

  customer: one(quickbooksCustomersModel, {
    fields: [invoiceModel.customerId],
    references: [quickbooksCustomersModel.id],
  }),

  lineItems: many(lineItemsModel, {
    relationName: "lineItems",
  }),
}));
