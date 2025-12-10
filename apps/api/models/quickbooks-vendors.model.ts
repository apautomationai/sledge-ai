import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  numeric,
  varchar,
  vector,
  index,
} from "drizzle-orm/pg-core";
import { QUICKBOOKS_EMBEDDING_DIMENSION } from "@/lib/vector.constants";
import { usersModel } from "./users.model";

// quickbooks schema doc https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/vendor

export const quickbooksVendorsModel = pgTable(
  "quickbooks_vendors",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersModel.id),
    quickbooksId: varchar("quickbooks_id", { length: 50 }).notNull(),
    // Name fields
    displayName: varchar("display_name", { length: 500 }),
    companyName: varchar("company_name", { length: 100 }),
    givenName: varchar("given_name", { length: 100 }),
    middleName: varchar("middle_name", { length: 100 }),
    familyName: varchar("family_name", { length: 100 }),
    title: varchar("title", { length: 16 }),
    suffix: varchar("suffix", { length: 16 }),
    printOnCheckName: varchar("print_on_check_name", { length: 100 }),
    // Contact information
    primaryEmail: varchar("primary_email", { length: 100 }),
    primaryPhone: varchar("primary_phone", { length: 20 }),
    mobile: varchar("mobile", { length: 20 }),
    alternatePhone: varchar("alternate_phone", { length: 20 }),
    fax: varchar("fax", { length: 20 }),
    website: varchar("website", { length: 100 }),
    // Address fields
    billAddrLine1: text("bill_addr_line1"),
    billAddrLine2: text("bill_addr_line2"),
    billAddrLine3: text("bill_addr_line3"),
    billAddrLine4: text("bill_addr_line4"),
    billAddrLine5: text("bill_addr_line5"),
    billAddrCity: varchar("bill_addr_city", { length: 50 }),
    billAddrState: varchar("bill_addr_state", { length: 50 }),
    billAddrPostalCode: varchar("bill_addr_postal_code", { length: 20 }),
    billAddrCountry: varchar("bill_addr_country", { length: 50 }),
    // Business fields
    acctNum: varchar("acct_num", { length: 100 }),
    taxIdentifier: varchar("tax_identifier", { length: 20 }),
    balance: numeric("balance"),
    active: boolean("active"),
    vendor1099: boolean("vendor1099"),
    // Rates
    billRate: numeric("bill_rate"),
    costRate: numeric("cost_rate"),
    // References
    termRefValue: varchar("term_ref_value", { length: 50 }),
    termRefName: varchar("term_ref_name", { length: 255 }),
    currencyRefValue: varchar("currency_ref_value", { length: 10 }),
    currencyRefName: varchar("currency_ref_name", { length: 255 }),
    apAccountRefValue: varchar("ap_account_ref_value", { length: 50 }),
    apAccountRefName: varchar("ap_account_ref_name", { length: 255 }),
    // Regional/advanced fields
    gstin: varchar("gstin", { length: 15 }),
    businessNumber: varchar("business_number", { length: 10 }),
    gstRegistrationType: varchar("gst_registration_type", { length: 15 }),
    hasTPAR: boolean("has_tpar"),
    t4AEligible: boolean("t4a_eligible"),
    t5018Eligible: boolean("t5018_eligible"),
    taxReportingBasis: varchar("tax_reporting_basis", { length: 50 }),
    // Sync metadata
    syncToken: varchar("sync_token", { length: 50 }),
    domain: varchar("domain", { length: 10 }),
    sparse: boolean("sparse"),
    metaDataCreateTime: timestamp("meta_data_create_time"),
    metaDataLastUpdatedTime: timestamp("meta_data_last_updated_time"),
    // Vector embedding
    embedding: vector("embedding", { dimensions: QUICKBOOKS_EMBEDDING_DIMENSION }),
    // Project relationship
    projectId: integer("project_id"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index('quickbooks_vendors_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
  ]
);

export const quickbooksVendorsRelations = relations(
  quickbooksVendorsModel,
  ({ one }) => ({
    user: one(usersModel, {
      fields: [quickbooksVendorsModel.userId],
      references: [usersModel.id],
    }),
  })
);

// Note: Import projectsModel when needed for the relation
// project: one(projectsModel, {
//   fields: [quickbooksVendorsModel.projectId],
//   references: [projectsModel.id],
// }),
