-- AlterTable: Add provider columns to key table
DO $$
BEGIN
    IF to_regclass('"key"') IS NOT NULL THEN
        ALTER TABLE "key" ADD COLUMN IF NOT EXISTS "provider_id" TEXT;
        ALTER TABLE "key" ADD COLUMN IF NOT EXISTS "provider_user_id" TEXT;
    END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF to_regclass('"key"') IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'key_provider_id_provider_user_id_key'
    ) THEN
        ALTER TABLE "key" ADD CONSTRAINT "key_provider_id_provider_user_id_key" UNIQUE ("provider_id", "provider_user_id");
    END IF;
END $$;

