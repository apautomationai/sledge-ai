CREATE TYPE "public"."contact_message_status" AS ENUM('new', 'in_progress', 'resolved', 'archived');--> statement-breakpoint
CREATE TYPE "public"."contact_subject" AS ENUM('general', 'technical', 'billing', 'integrations', 'sales', 'security', 'feedback', 'other');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"subject" "contact_subject" NOT NULL,
	"message" text NOT NULL,
	"status" "contact_message_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
