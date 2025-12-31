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

export const quickbooksCustomersModel = pgTable(
    "quickbooks_customers",
    {
        id: serial("id").primaryKey(),
        userId: integer("user_id").notNull().references(() => usersModel.id),
        quickbooksId: varchar("quickbooks_id", { length: 50 }),
        displayName: varchar("display_name", { length: 500 }),
        companyName: varchar("company_name", { length: 100 }),
        givenName: varchar("given_name", { length: 100 }),
        familyName: varchar("family_name", { length: 100 }),
        primaryEmail: varchar("primary_email", { length: 100 }),
        primaryPhone: varchar("primary_phone", { length: 20 }),
        billAddrLine1: text("bill_addr_line1"),
        billAddrCity: varchar("bill_addr_city", { length: 50 }),
        billAddrState: varchar("bill_addr_state", { length: 50 }),
        billAddrPostalCode: varchar("bill_addr_postal_code", { length: 20 }),
        billAddrCountry: varchar("bill_addr_country", { length: 50 }),
        balance: numeric("balance"),
        active: boolean("active"),
        syncToken: varchar("sync_token", { length: 50 }),
        metaDataCreateTime: timestamp("meta_data_create_time"),
        metaDataLastUpdatedTime: timestamp("meta_data_last_updated_time"),
        embedding: vector("embedding", { dimensions: QUICKBOOKS_EMBEDDING_DIMENSION }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => [
        index('quickbooks_customers_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
    ]
);

export const quickbooksCustomersRelations = relations(
    quickbooksCustomersModel,
    ({ one }) => ({
        user: one(usersModel, {
            fields: [quickbooksCustomersModel.userId],
            references: [usersModel.id],
        }),
    })
);