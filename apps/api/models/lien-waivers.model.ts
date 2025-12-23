import {
    pgTable,
    text,
    timestamp,
    serial,
    integer,
    boolean,
    varchar
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { projectsModel } from "./projects.model";

export type LienWaiverStatus = 'pending' | 'signed' | 'rejected';
export type LienWaiverType = 'conditional' | 'unconditional';

export const lienWaiversModel = pgTable("lien_waivers", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    projectId: text("project_id").notNull(),
    waiverType: varchar("waiver_type", { length: 20 }).notNull().default("unconditional").$type<LienWaiverType>(),
    signedFileUrl: text("signed_file_url"),
    billingCycle: integer("billing_cycle").notNull(),
    throughDate: timestamp("through_date", { mode: 'string' }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("pending").$type<LienWaiverStatus>(),
    vendorName: text("vendor_name").notNull(),
    vendorEmail: text("vendor_email"),
    customerName: text("customer_name"),
    amount: varchar("amount", { length: 255 }).notNull().default("0"),
    isSigned: boolean("is_signed").default(false).notNull(),
    signedAt: timestamp("signed_at", { mode: 'string' }),
    createdAt: timestamp("created_at", { mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const lienWaiversRelations = relations(lienWaiversModel, ({ one }) => ({
    project: one(projectsModel, {
        fields: [lienWaiversModel.projectId],
        references: [projectsModel.id],
    }),
}));
