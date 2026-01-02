ALTER TABLE "invoices" ADD COLUMN "customer_id" integer;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "rejection_email_sender" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "vendor_address";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "vendor_phone";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "vendor_email";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "customer_name";