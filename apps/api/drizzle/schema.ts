import { pgTable, serial, integer, timestamp, index, foreignKey, unique, varchar, boolean, text, numeric, pgEnum, jsonb } from "drizzle-orm/pg-core"

export const provider = pgEnum("provider", ['local', 'gmail', 'outlook'])
export const status = pgEnum("status", ['pending', 'approved', 'rejected', 'failed', 'not_connected'])
export const itemType = pgEnum("item_type", ['account', 'product'])

export const registrationCounter = pgTable("registration_counter", {
	id: serial().primaryKey().notNull(),
	currentCount: integer("current_count").default(0).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	registrationOrder: integer("registration_order").notNull(),
	trialStart: timestamp("trial_start", { mode: 'string' }),
	trialEnd: timestamp("trial_end", { mode: 'string' }),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
	stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
	stripePriceId: varchar("stripe_price_id", { length: 255 }),
	status: varchar({ length: 20 }).default('active'),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	tier: varchar({ length: 20 }).notNull(),
}, (table) => [
	index("idx_subscriptions_stripe_customer").using("btree", table.stripeCustomerId.asc().nullsLast().op("text_ops")),
	index("idx_subscriptions_user_id").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "subscriptions_user_id_users_id_fk"
	}),
	unique("subscriptions_registration_order_unique").on(table.registrationOrder),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	firstName: varchar("first_name", { length: 255 }).notNull(),
	lastName: varchar("last_name", { length: 255 }),
	avatar: varchar({ length: 255 }),
	businessName: varchar("business_name", { length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: text("password_hash").notNull(),
	provider: varchar({ length: 255 }).default('credentials').notNull(),
	providerId: varchar("provider_id", { length: 255 }),
	phone: varchar({ length: 20 }),
	isActive: boolean("is_active").default(true).notNull(),
	isBanned: boolean("is_banned").default(false).notNull(),
	lastLogin: timestamp("last_login", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const integrations = pgTable("integrations", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	name: text().notNull(),
	status: status().default('not_connected').notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	tokenType: text("token_type"),
	expiryDate: timestamp("expiry_date", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	startReading: timestamp("start_reading", { mode: 'string' }),
	lastRead: timestamp("last_read", { mode: 'string' }).defaultNow(),
	metadata: jsonb().default({}), // JSONB field for integration-specific data
});

export const invoices = pgTable("invoices", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	attachmentId: integer("attachment_id").notNull(),
	invoiceNumber: varchar("invoice_number", { length: 50 }),
	vendorId: varchar("vendor_id", { length: 255 }),
	vendorAddress: text("vendor_address"),
	vendorPhone: varchar("vendor_phone", { length: 50 }),
	vendorEmail: varchar("vendor_email", { length: 255 }),
	customerName: varchar("customer_name", { length: 255 }),
	invoiceDate: timestamp("invoice_date", { mode: 'string' }),
	dueDate: timestamp("due_date", { mode: 'string' }),
	totalAmount: numeric("total_amount"),
	currency: varchar({ length: 10 }),
	totalTax: numeric("total_tax"),
	description: text(),
	fileUrl: text("file_url"),
	fileKey: text("file_key"),
	s3JsonKey: text("s3_json_key"),
	status: status().default('pending').notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_invoices_is_deleted").using("btree", table.isDeleted.asc().nullsLast().op("bool_ops")),
]);

export const attachments = pgTable("attachments", {
	id: serial().primaryKey().notNull(),
	hashId: text("hash_id"),
	userId: integer("user_id").notNull(),
	emailId: text("email_id"),
	filename: text().notNull(),
	mimeType: text("mime_type").notNull(),
	sender: text(),
	receiver: text(),
	provider: provider().default('local').notNull(),
	fileUrl: text("file_url"),
	fileKey: text("file_key"),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	status: text().default('pending').notNull(),
}, (table) => [
	index("idx_attachments_is_deleted").using("btree", table.isDeleted.asc().nullsLast().op("bool_ops")),
]);

export const lineItems = pgTable("line_items", {
	id: serial().primaryKey().notNull(),
	invoiceId: integer("invoice_id").notNull(),
	itemName: text("item_name"),
	description: text(),
	quantity: numeric(),
	rate: numeric(),
	amount: numeric(),
	itemType: itemType("item_type"),
	resourceId: integer("resource_id"),
	customerId: integer("customer_id"),
});

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	address: text().notNull(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 50 }),
	postalCode: varchar("postal_code", { length: 20 }),
	country: varchar({ length: 50 }),
	imageUrl: text("image_url"),
	billingCycle: integer("billing_cycle").default(30).notNull(),
	totalBillingCycles: integer("total_billing_cycles").default(1).notNull(),
	currentBillingCycle: integer("current_billing_cycle").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("projects_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int4_ops")),
	index("projects_address_idx").using("btree", table.address.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "projects_user_id_users_id_fk"
	}),
]);

export const lienWaivers = pgTable("lien_waivers", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	projectId: integer("project_id").notNull(),
	waiverType: varchar("waiver_type", { length: 20 }).notNull().default("unconditional"),
	signedFileUrl: text("signed_file_url"),
	billingCycle: integer("billing_cycle").notNull(),
	throughDate: timestamp("through_date", { mode: 'string' }).notNull(),
	status: varchar("status", { length: 20 }).notNull().default("pending"),
	vendorName: text("vendor_name").notNull(),
	vendorEmail: text("vendor_email"),
	customerName: text("customer_name"),
	amount: numeric("amount").notNull(),
	isSigned: boolean("is_signed").default(false).notNull(),
	signedAt: timestamp("signed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' })
		.defaultNow()
		.notNull(),
}, (table) => [
	foreignKey({
		columns: [table.projectId],
		foreignColumns: [projects.id],
		name: "lien_waivers_project_id_projects_id_fk"
	}),
]);

export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey().notNull(),
	token: text("token").notNull().unique(), // random string
	type: varchar("type", { length: 255 }).notNull(),
	data: jsonb().default({}).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	used: boolean("used").default(false),
	createdAt: timestamp("created_at", { mode: 'string' })
		.defaultNow()
		.notNull(),
});