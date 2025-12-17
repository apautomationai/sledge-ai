ALTER TABLE "attachments" ADD COLUMN "processed_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "attachments" ADD COLUMN "processed_time" numeric;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "billing_cycle_start_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "billing_cycle_end_date" timestamp;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "status" varchar(50) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_start_date" timestamp;