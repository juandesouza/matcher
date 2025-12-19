# Memory Limit Fix

## Problem
The Render service exceeded its memory limit when running the seed script through the API endpoint. This happened because:
1. Running `npx prisma generate` uses memory
2. Running the seed script creates database connections
3. The API endpoint runs both operations in the same process

## Solution
Use the **local seed script** (`seed-render.sh`) that connects directly to Render's database from your local machine. This avoids memory issues on Render.

## Steps

1. **Get your Render Database URL:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click on your **PostgreSQL service** (not the web service)
   - Go to the **"Info"** tab
   - Copy the **"Internal Database URL"** (use Internal, not External)

2. **Run the seed script locally:**
   ```bash
   cd web
   ./seed-render.sh 'postgresql://your-render-database-url'
   ```

This will:
- Delete all existing fake users
- Create 2 fake men and 2 fake women
- Use your local machine's resources (no Render memory limit)

## Alternative: Use Render Shell

If you prefer to run it on Render:
1. Go to Render Dashboard → Your Web Service → Shell
2. Run: `cd web && npx prisma db seed`

Note: The seed script now only creates 2 men and 2 women, so it should use much less memory.

