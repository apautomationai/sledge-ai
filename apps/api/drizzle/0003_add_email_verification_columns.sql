-- Migration: Add email verification columns to users table
-- This migration adds is_verified and verification_token columns
-- Compatible with existing data: all existing users will have is_verified=false by default

DO $$
BEGIN
    -- Add is_verified column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "is_verified" boolean DEFAULT false NOT NULL;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN
        -- Column already exists, do nothing
        NULL;
END $$;
--> statement-breakpoint

DO $$
BEGIN
    -- Add verification_token column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'verification_token'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "verification_token" varchar(255);
    END IF;
EXCEPTION
    WHEN duplicate_column THEN
        -- Column already exists, do nothing
        NULL;
END $$;
--> statement-breakpoint

DO $$
BEGIN
    -- Add verification_token_expiry column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'verification_token_expiry'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "verification_token_expiry" timestamp;
    END IF;
EXCEPTION
    WHEN duplicate_column THEN
        -- Column already exists, do nothing
        NULL;
END $$;
--> statement-breakpoint

-- Set is_verified=true for existing OAuth users (Google and Microsoft)
-- This ensures backward compatibility with users who signed up via OAuth
DO $$
BEGIN
    UPDATE "users"
    SET "is_verified" = true
    WHERE "provider" IN ('google', 'microsoft')
    AND "is_verified" = false;
EXCEPTION
    WHEN OTHERS THEN
        -- If update fails, log but don't break migration
        RAISE NOTICE 'Could not update existing OAuth users: %', SQLERRM;
END $$;
