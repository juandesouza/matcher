# Database Seeding Guide

This guide explains how to populate the Render database with fake users for testing.

## What the Seed Script Does

The seed script (`prisma/seed.js`) creates:
- **30 fake women** with profiles, photos, and locations
- **30 fake men** with profiles, photos, and locations
- Authentication keys for all fake users (so they can appear in the system)

All fake users are distributed across three cities in Bahia, Brazil:
- Ilhéus (10 of each gender)
- Una (10 of each gender)
- Canavieiras (10 of each gender)

## Running the Seed Script

### Option 1: Using Prisma Seed Command (Recommended)

On Render, use the Shell feature:

1. Go to your Render Dashboard
2. Click on your web service (`matcher-web`)
3. Click on **Shell** (in the left sidebar)
4. Run the following commands:

```bash
cd web
npx prisma db seed
```

### Option 2: Direct Node Execution

If the Prisma seed command doesn't work, you can run it directly:

```bash
cd web
node prisma/seed.js
```

### Option 3: Local Testing (Before Deploying)

Test the seed script locally first:

```bash
cd web
# Make sure your local .env points to your local database
node prisma/seed.js
```

## What to Expect

The script will:
1. Check for existing fake users (warns if found)
2. Create 30 fake women profiles
3. Create 30 fake men profiles
4. Create authentication keys for all users
5. Display a summary of created users

**Output example:**
```
🌱 Starting database seed...

Creating 30 fake women...

Creating 10 women profiles for Ilhéus...
  ✓ Created: Ana [FAKE FOR TESTING] (25 years old) - Ilhéus
  ...

✅ Successfully created 30 fake women profiles!

Creating 30 fake men...

...

==================================================
✅ Seed completed successfully!
   Created 30 fake women
   Created 30 fake men
   Total: 60 fake users
==================================================
```

## Important Notes

1. **Existing Fake Users**: If fake users already exist, the script will create additional ones. To start fresh, delete existing fake users first.

2. **Database Connection**: Make sure `DATABASE_URL` is set correctly in your Render environment variables.

3. **Migrations**: Ensure database migrations have been run before seeding:
   ```bash
   npm run db:migrate
   ```

4. **Fake User Identification**: All fake users have:
   - Email starting with `fake_`
   - Name ending with `[FAKE FOR TESTING]`
   - No password (they can't log in, but appear in card swipes)

## Troubleshooting

### "Cannot find module 'lucia'"
- Make sure dependencies are installed: `npm install`

### "Database connection failed"
- Verify `DATABASE_URL` is set in Render environment variables
- Check that your PostgreSQL service is running

### "Unique constraint violation"
- Some fake users may already exist
- The script will skip duplicates and continue

### "Prisma Client not generated"
- Run: `npx prisma generate`
- Then run the seed script again

## Verifying the Seed

After running the seed, you can verify users were created:

1. Use Prisma Studio:
   ```bash
   npx prisma studio
   ```
   Then filter users by email containing `fake_`

2. Or check via your app's API (if you have an admin endpoint)

## Re-seeding

If you need to re-seed (delete and recreate):

1. Delete existing fake users manually, or
2. Run the seed script again (it will create additional users)

To delete all fake users:
```sql
-- Connect to your database and run:
DELETE FROM "User" WHERE email LIKE 'fake_%';
DELETE FROM "key" WHERE "provider_user_id" LIKE 'fake_%';
```

