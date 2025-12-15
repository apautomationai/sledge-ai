-- Add soft delete columns to projects table
ALTER TABLE "projects" ADD COLUMN "is_deleted" boolean DEFAULT false NOT NULL;
ALTER TABLE "projects" ADD COLUMN "deleted_at" timestamp;

-- Create index on is_deleted for faster queries
CREATE INDEX IF NOT EXISTS "projects_is_deleted_idx" ON "projects" ("is_deleted");
