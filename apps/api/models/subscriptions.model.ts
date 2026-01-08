import {
    pgTable,
    varchar,
    timestamp,
    boolean,
    serial,
    integer,
    unique,
    index,
} from "drizzle-orm/pg-core";
import { usersModel } from "./users.model";

export const subscriptionsModel = pgTable("subscriptions", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => usersModel.id),
    registrationOrder: integer("registration_order").notNull().unique(),
    tier: varchar("tier", { length: 20 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    trialStart: timestamp("trial_start"),
    trialEnd: timestamp("trial_end"),
    stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
    stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
    stripePriceId: varchar("stripe_price_id", { length: 255 }),
    promoCode: varchar("promo_code", { length: 50 }),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index("idx_subscriptions_user_id").on(table.userId),
    stripeCustomerIdx: index("idx_subscriptions_stripe_customer").on(table.stripeCustomerId),
    registrationOrderIdx: unique("idx_subscriptions_registration_order").on(table.registrationOrder),
}));

export const registrationCounterModel = pgTable("registration_counter", {
    id: serial("id").primaryKey(),
    currentCount: integer("current_count").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});