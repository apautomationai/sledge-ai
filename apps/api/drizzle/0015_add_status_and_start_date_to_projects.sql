-- Migration: Add status and project_start_date to projects table
-- Created: 2024-12-16

-- Add status column with default value
ALTER TABLE "projects" ADD COLUMN "status" varchar(50) DEFAULT 'active' NOT NULL;

-- Add project_start_date column
ALTER TABLE "projects" ADD COLUMN "project_start_date" timestamp;

-- Add comment for status field
COMMENT ON COLUMN "projects"."status" IS 'Project status: active, completed, on_hold, cancelled';

-- Add comment for project_start_date field
COMMENT ON COLUMN "projects"."project_start_date" IS 'Date when the project officially started';