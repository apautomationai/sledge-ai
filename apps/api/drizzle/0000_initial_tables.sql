DO $$ BEGIN
    CREATE TYPE "public"."provider" AS ENUM('local', 'gmail', 'outlook');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."integration_status" AS ENUM('success', 'failed', 'not_connected', 'disconnected', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."invoice_status" AS ENUM('pending', 'approved', 'rejected', 'failed', 'not_connected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."item_type" AS ENUM('account', 'product');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    CREATE TYPE "public"."line_item_view_type" AS ENUM('single', 'expanded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"hash_id" text,
	"user_id" integer NOT NULL,
	"email_id" text,
	"filename" text NOT NULL,
	"mime_type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"sender" text,
	"receiver" text,
	"provider" "provider" DEFAULT 'local' NOT NULL,
	"file_url" text,
	"file_key" text,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"processed_at" timestamp DEFAULT now(),
	"processed_time" numeric
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"provider_id" text,
	"email" text,
	"status" "integration_status" DEFAULT 'not_connected' NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"token_type" text,
	"expiry_date" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"attachment_id" integer NOT NULL,
	"invoice_number" varchar(50),
	"vendor_id" integer,
	"customer_id" integer,
	"invoice_date" timestamp,
	"due_date" timestamp,
	"total_amount" numeric,
	"total_quantity" numeric,
	"currency" varchar(10),
	"total_tax" numeric,
	"description" text,
	"file_url" text,
	"file_key" text,
	"s3_json_key" text,
	"delivery_address" text,
	"status" "invoice_status" DEFAULT 'pending' NOT NULL,
	"rejection_email_sender" varchar(255),
	"rejection_reason" text,
	"is_duplicate" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "line_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"item_name" text,
	"description" text,
	"quantity" numeric,
	"rate" numeric,
	"amount" numeric,
	"item_type" "item_type",
	"resource_id" varchar(50),
	"customer_id" varchar(50),
	"view_type" "line_item_view_type" DEFAULT 'expanded' NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"vendor_id" integer NOT NULL,
	"total_invoiced" numeric DEFAULT '0',
	"invoice_count" integer DEFAULT 0,
	"first_invoice_date" timestamp,
	"last_invoice_date" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100),
	"state" varchar(50),
	"postal_code" varchar(20),
	"country" varchar(50),
	"image_url" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"billing_cycle_start_date" timestamp,
	"billing_cycle_end_date" timestamp,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"project_start_date" timestamp,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quickbooks_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quickbooks_id" varchar(50) NOT NULL,
	"name" varchar(255),
	"sub_account" boolean,
	"parent_ref_value" varchar(50),
	"fully_qualified_name" varchar(255),
	"active" boolean,
	"classification" varchar(50),
	"account_type" varchar(50),
	"account_sub_type" varchar(100),
	"current_balance" numeric,
	"current_balance_with_sub_accounts" numeric,
	"currency_ref_value" varchar(10),
	"currency_ref_name" varchar(255),
	"domain" varchar(10),
	"sparse" boolean,
	"sync_token" varchar(50),
	"meta_data_create_time" timestamp,
	"meta_data_last_updated_time" timestamp,
	"embedding" vector(1536),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quickbooks_customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quickbooks_id" varchar(50),
	"display_name" varchar(500),
	"company_name" varchar(100),
	"given_name" varchar(100),
	"family_name" varchar(100),
	"primary_email" varchar(100),
	"primary_phone" varchar(20),
	"bill_addr_line1" text,
	"bill_addr_city" varchar(50),
	"bill_addr_state" varchar(50),
	"bill_addr_postal_code" varchar(20),
	"bill_addr_country" varchar(50),
	"balance" numeric,
	"active" boolean,
	"sync_token" varchar(50),
	"meta_data_create_time" timestamp,
	"meta_data_last_updated_time" timestamp,
	"embedding" vector(1536),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quickbooks_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quickbooks_id" varchar(50) NOT NULL,
	"name" varchar(255),
	"description" text,
	"active" boolean,
	"fully_qualified_name" varchar(255),
	"taxable" boolean,
	"unit_price" numeric,
	"type" varchar(50),
	"income_account_value" varchar(50),
	"income_account_name" varchar(255),
	"purchase_desc" text,
	"purchase_cost" numeric,
	"expense_account_value" varchar(50),
	"expense_account_name" varchar(255),
	"asset_account_value" varchar(50),
	"asset_account_name" varchar(255),
	"track_qty_on_hand" boolean,
	"qty_on_hand" numeric,
	"inv_start_date" timestamp,
	"domain" varchar(10),
	"sparse" boolean,
	"sync_token" varchar(50),
	"meta_data_create_time" timestamp,
	"meta_data_last_updated_time" timestamp,
	"embedding" vector(1536),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quickbooks_vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quickbooks_id" varchar(50) NOT NULL,
	"display_name" varchar(500),
	"company_name" varchar(100),
	"given_name" varchar(100),
	"middle_name" varchar(100),
	"family_name" varchar(100),
	"title" varchar(16),
	"suffix" varchar(16),
	"print_on_check_name" varchar(100),
	"primary_email" varchar(100),
	"primary_phone" varchar(20),
	"mobile" varchar(20),
	"alternate_phone" varchar(20),
	"fax" varchar(20),
	"website" varchar(100),
	"bill_addr_line1" text,
	"bill_addr_line2" text,
	"bill_addr_line3" text,
	"bill_addr_line4" text,
	"bill_addr_line5" text,
	"bill_addr_city" varchar(50),
	"bill_addr_state" varchar(50),
	"bill_addr_postal_code" varchar(20),
	"bill_addr_country" varchar(50),
	"acct_num" varchar(100),
	"tax_identifier" varchar(20),
	"balance" numeric,
	"active" boolean,
	"vendor1099" boolean,
	"bill_rate" numeric,
	"cost_rate" numeric,
	"term_ref_value" varchar(50),
	"term_ref_name" varchar(255),
	"currency_ref_value" varchar(10),
	"currency_ref_name" varchar(255),
	"ap_account_ref_value" varchar(50),
	"ap_account_ref_name" varchar(255),
	"gstin" varchar(15),
	"business_number" varchar(10),
	"gst_registration_type" varchar(15),
	"has_tpar" boolean,
	"t4a_eligible" boolean,
	"t5018_eligible" boolean,
	"tax_reporting_basis" varchar(50),
	"sync_token" varchar(50),
	"domain" varchar(10),
	"sparse" boolean,
	"meta_data_create_time" timestamp,
	"meta_data_last_updated_time" timestamp,
	"embedding" vector(1536),
	"project_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "registration_counter" (
	"id" serial PRIMARY KEY NOT NULL,
	"current_count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"registration_order" integer NOT NULL,
	"tier" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"stripe_price_id" varchar(255),
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_registration_order_unique" UNIQUE("registration_order"),
	CONSTRAINT "idx_subscriptions_registration_order" UNIQUE("registration_order")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255),
	"avatar" varchar(255),
	"business_name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"provider" varchar(255) DEFAULT 'credentials' NOT NULL,
	"provider_id" varchar(255),
	"phone" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"last_login" timestamp DEFAULT now(),
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "project_vendors" ADD CONSTRAINT "project_vendors_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "project_vendors" ADD CONSTRAINT "project_vendors_vendor_id_quickbooks_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."quickbooks_vendors"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "quickbooks_accounts" ADD CONSTRAINT "quickbooks_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "quickbooks_customers" ADD CONSTRAINT "quickbooks_customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "quickbooks_products" ADD CONSTRAINT "quickbooks_products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "quickbooks_vendors" ADD CONSTRAINT "quickbooks_vendors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
    ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quickbooks_accounts_embedding_idx" ON "quickbooks_accounts" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quickbooks_customers_embedding_idx" ON "quickbooks_customers" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quickbooks_products_embedding_idx" ON "quickbooks_products" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "quickbooks_vendors_embedding_idx" ON "quickbooks_vendors" USING hnsw ("embedding" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subscriptions_user_id" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_subscriptions_stripe_customer" ON "subscriptions" USING btree ("stripe_customer_id");
