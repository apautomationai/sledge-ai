ALTER TABLE "line_items" ADD COLUMN "quickbooks_id" varchar(50);--> statement-breakpoint
ALTER TABLE "line_items" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "line_items" ADD COLUMN "updated_at" timestamp DEFAULT now();