import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// Status enum for contact message lifecycle
export const contactMessageStatusEnum = pgEnum("contact_message_status", [
  "new",
  "in_progress",
  "resolved",
  "archived",
]);

// Subject enum matching the form dropdown options
export const contactSubjectEnum = pgEnum("contact_subject", [
  "general",
  "technical",
  "billing",
  "integrations",
  "sales",
  "security",
  "feedback",
  "other",
]);

export const contactMessagesModel = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: contactSubjectEnum("subject").notNull(),
  message: text("message").notNull(),
  status: contactMessageStatusEnum("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});
