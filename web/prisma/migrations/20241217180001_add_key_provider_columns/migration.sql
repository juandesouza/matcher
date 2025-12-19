-- AlterTable: Add provider columns to key table
ALTER TABLE "key" ADD COLUMN IF NOT EXISTS "provider_id" TEXT;
ALTER TABLE "key" ADD COLUMN IF NOT EXISTS "provider_user_id" TEXT;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'key_provider_id_provider_user_id_key'
    ) THEN
        ALTER TABLE "key" ADD CONSTRAINT "key_provider_id_provider_user_id_key" UNIQUE ("provider_id", "provider_user_id");
    END IF;
END $$;

