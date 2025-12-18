# Seeding Render Database from Local Machine

This guide explains how to seed your Render database with fake users from your local machine.

## Quick Start

1. **Get your Render DATABASE_URL:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click on your **PostgreSQL service** (not the web service)
   - Go to the **"Info"** tab
   - Copy the **"Internal Database URL"** (it looks like `postgresql://user:pass@host:5432/dbname`)

2. **Run the seed script:**
   ```bash
   cd web
   ./seed-render.sh 'postgresql://your-render-database-url'
   ```

## Detailed Steps

### Step 1: Get Render Database URL

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Find your PostgreSQL database service (usually named something like `matcher-db` or `postgres`)
3. Click on it to open the service details
4. Go to the **"Info"** tab
5. Find **"Internal Database URL"** (use Internal, not External)
6. Copy the entire connection string

**Important:** Use the **Internal Database URL**, not the External one. The Internal URL works from Render's network.

### Step 2: Run Seed Script

```bash
cd web
./seed-render.sh 'postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/dbname'
```

Replace the connection string with your actual Render database URL.

### Step 3: Verify

After running the script, you should see:
```
✅ Seed completed successfully!
   Created 30 fake women
   Created 30 fake men
   Total: 60 fake users
```

## Alternative: Manual Method

If the script doesn't work, you can run it manually:

```bash
cd web
export DATABASE_URL='postgresql://your-render-database-url'
npx prisma generate
node prisma/seed.js
```

## Troubleshooting

### "Connection refused" or "Can't reach database server"
- **Cause:** You're using the External Database URL, or the database is paused
- **Fix:** 
  - Use the **Internal Database URL** (starts with `postgresql://` and has `render.com` in the host)
  - Make sure your PostgreSQL service is running (not paused) in Render

### "password authentication failed"
- **Cause:** The DATABASE_URL is incorrect or the password has special characters
- **Fix:** Make sure you copied the entire URL correctly, including special characters (they should be URL-encoded)

### "database does not exist"
- **Cause:** The database name in the URL is wrong
- **Fix:** Check the database name in Render dashboard

### "Prisma Client not generated"
- **Fix:** The script should run `prisma generate` automatically, but if it fails, run manually:
  ```bash
  npx prisma generate
  ```

## Security Note

⚠️ **Never commit your DATABASE_URL to git!** The connection string contains sensitive credentials.

## What Gets Created

The seed script creates:
- **30 fake women** with profiles, photos, and locations
- **30 fake men** with profiles, photos, and locations
- **Authentication keys** for all fake users

All users are distributed across three cities in Bahia, Brazil:
- Ilhéus (10 of each gender)
- Una (10 of each gender)
- Canavieiras (10 of each gender)

