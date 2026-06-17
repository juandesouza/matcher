-- Safely add gender only when "User" table already exists.
DO $$
BEGIN
    IF to_regclass('"User"') IS NOT NULL THEN
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" TEXT;
    END IF;
END $$;

