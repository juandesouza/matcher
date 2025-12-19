# Seeding Render Database via API

This guide explains how to seed your Render database using the Render API and an admin endpoint.

## Overview

The seeding process works by:
1. Calling an admin API endpoint on your Render service (`/api/admin/seed`)
2. The endpoint executes the Prisma seed script on the Render server
3. The seed script creates 30 fake male and 30 fake female profiles

## Prerequisites

1. **Render API Key**: Get it from [Render Dashboard → Account → API Keys](https://dashboard.render.com/account/api-keys)
2. **Render Service Deployed**: Your web service must be deployed and running on Render
3. **Environment Variables**: Set in `web/.env`:
   - `RENDER_API_KEY` - Your Render API key
   - `RENDER_SERVICE_URL` - Your Render service URL (e.g., `https://matcher-m0o4.onrender.com`)
   - `SEED_SECRET` - Secret for the admin endpoint (optional, defaults to a temporary value)

## Setup

1. **Add environment variables to `web/.env`**:
   ```bash
   RENDER_API_KEY=rnd_...
   RENDER_SERVICE_URL=https://matcher-m0o4.onrender.com
   SEED_SECRET=your-secret-here  # Optional, but recommended for security
   ```

2. **Add `SEED_SECRET` to Render environment variables**:
   - Go to Render Dashboard → Your Web Service → Environment
   - Add `SEED_SECRET` with the same value as in your local `.env`
   - This ensures the admin endpoint accepts your requests

## Running the Seed Script

### Method 1: Using the API Script (Recommended)

```bash
cd web
node seed-render-api.js
```

The script will:
1. Verify your Render API key
2. Find your Render service
3. Call the admin seed endpoint
4. Display the results

### Method 2: Direct API Call

You can also call the endpoint directly using curl:

```bash
curl -X POST https://matcher-m0o4.onrender.com/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"secret": "your-seed-secret"}'
```

## What Gets Created

The seed script creates:
- **30 fake female profiles** with:
  - Random names, ages (18-35), bios, and photos
  - Locations in Ilhéus, Una, and Canavieiras (Bahia, Brazil)
  - Authentication keys for login
  
- **30 fake male profiles** with:
  - Random names, ages (18-35), bios, and photos
  - Locations in Ilhéus, Una, and Canavieiras (Bahia, Brazil)
  - Authentication keys for login

All fake users are marked with `[FAKE FOR TESTING]` in their names.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change the default `SEED_SECRET`** in production
2. **Remove or disable the admin endpoint** after seeding if you don't need it
3. **Use HTTPS** for all API calls
4. **Restrict access** to the admin endpoint (e.g., IP whitelist) if keeping it enabled

## Troubleshooting

### "Unauthorized" Error

- Check that `SEED_SECRET` in your local `.env` matches the one in Render environment variables
- Verify the secret is being sent correctly in the request

### "Service not found"

- Verify `RENDER_SERVICE_URL` is correct in your `.env`
- Check that your Render service is deployed and running

### "Seed script failed"

- Check Render service logs for detailed error messages
- Verify `DATABASE_URL` is set correctly in Render environment variables
- Ensure Prisma migrations have been run (`npm run db:migrate`)

### Connection Timeout

- Check that your Render service is running (not paused)
- Verify the service URL is correct
- Check Render status page: https://status.render.com

## Verifying the Seed

After running the seed, you can verify it worked by:

1. **Check Render logs**: Look for seed output in your service logs
2. **Query the database**: Use Prisma Studio or a database client
3. **Test in app**: Try logging in with a fake user (check seed script for email patterns)

## Re-running the Seed

⚠️ **Warning**: Running the seed multiple times will create duplicate users. 

To re-seed:
1. Clear existing fake users from the database
2. Run the seed script again

Or modify the seed script to check for existing users before creating new ones.

