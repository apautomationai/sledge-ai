-- Create quickbooks_customers table
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

-- Add foreign key constraint to users table
ALTER TABLE "quickbooks_customers" ADD CONSTRAINT "quickbooks_customers_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS "quickbooks_customers_user_id_idx" ON "quickbooks_customers" ("user_id");

-- Create index on display_name for faster lookups
CREATE INDEX IF NOT EXISTS "quickbooks_customers_display_name_idx" ON "quickbooks_customers" ("display_name");

-- Create index on company_name for faster lookups
CREATE INDEX IF NOT EXISTS "quickbooks_customers_company_name_idx" ON "quickbooks_customers" ("company_name");

-- Create HNSW index for vector similarity search using cosine distance
CREATE INDEX IF NOT EXISTS "quickbooks_customers_embedding_idx" ON "quickbooks_customers" 
  USING hnsw ("embedding" vector_cosine_ops);
