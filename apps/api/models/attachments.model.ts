import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  numeric
} from "drizzle-orm/pg-core";
import { usersModel } from "./users.model";
import { invoiceModel } from "./invoice.model";
import { relations } from "drizzle-orm";
export const providerEnum = pgEnum("provider", ["local", "gmail", "outlook"]);

export const attachmentsModel = pgTable("attachments", {
  id: serial("id").primaryKey(),
  hashId: text("hash_id"),
  userId: integer("user_id").notNull(),
  emailId: text("email_id"),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  status: text("status").notNull().default("pending"),
  sender: text("sender"),
  receiver: text("receiver"),
  provider: providerEnum("provider").notNull().default("local"),
  fileUrl: text("file_url"),
  fileKey: text("file_key"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  processed_at: timestamp("processed_at").defaultNow(),
  processed_time: numeric("processed_time")
});

export const attachmentsRelations = relations(
  attachmentsModel,
  ({ one, many }) => ({
    user: one(usersModel, {
      fields: [attachmentsModel.userId],
      references: [usersModel.id],
    }),
    invoice: many(invoiceModel),
  })
);
