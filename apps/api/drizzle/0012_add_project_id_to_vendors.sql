-- Add project_id column to quickbooks_vendors table
ALTER TABLE "quickbooks_vendors" ADD COLUMN "project_id" integer;

-- Create index on project_id for faster queries
CREATE INDEX IF NOT EXISTS "quickbooks_vendors_project_id_idx" ON "quickbooks_vendors" ("project_id");

-- Add foreign key constraint (optional, but recommended)
ALTER TABLE "quickbooks_vendors" 
ADD CONSTRAINT "quickbooks_vendors_project_id_projects_id_fk" 
FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL;
