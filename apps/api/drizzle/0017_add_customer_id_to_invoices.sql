-- Add customer_id column to invoices table
ALTER TABLE "invoices" ADD COLUMN "customer_id" integer;

-- Add foreign key constraint to quickbooks_customers table
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_quickbooks_customers_id_fk" 
  FOREIGN KEY ("customer_id") REFERENCES "quickbooks_customers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- Create index on customer_id for faster queries
CREATE INDEX IF NOT EXISTS "invoices_customer_id_idx" ON "invoices" ("customer_id");
