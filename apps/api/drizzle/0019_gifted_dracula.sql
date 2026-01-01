CREATE TYPE "public"."line_item_view_type" AS ENUM('single', 'expanded');--> statement-breakpoint
ALTER TABLE "quickbooks_customers" ALTER COLUMN "quickbooks_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "line_items" ADD COLUMN "view_type" "line_item_view_type" DEFAULT 'expanded' NOT NULL;