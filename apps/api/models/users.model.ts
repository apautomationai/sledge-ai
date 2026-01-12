import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  serial,
} from "drizzle-orm/pg-core";

export const usersModel = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }),
  avatar: varchar("avatar", { length: 255 }),
  businessName: varchar("business_name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  provider: varchar("provider", { length: 255 }).notNull().default("credentials"),
  providerId: varchar("provider_id", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  isActive: boolean("is_active").default(true).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  lastLogin: timestamp("last_login").defaultNow(),
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});
