-- Create projects table
CREATE TABLE IF NOT EXISTS "projects" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "name" varchar(255) NOT NULL,
  "address" text NOT NULL,
  "city" varchar(100),
  "state" varchar(50),
  "postal_code" varchar(20),
  "country" varchar(50),
  "image_url" text,
  "billing_cycle" integer DEFAULT 30 NOT NULL,
  "total_billing_cycles" integer DEFAULT 1 NOT NULL,
  "current_billing_cycle" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS "projects_user_id_idx" ON "projects" ("user_id");

-- Create index on address for faster lookups
CREATE INDEX IF NOT EXISTS "projects_address_idx" ON "projects" ("address");
