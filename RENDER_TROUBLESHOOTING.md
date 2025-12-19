# Render Deployment Troubleshooting

## Common 500 Error Causes

### 1. Database Connection Issues

**Symptoms:**
- 500 error on page load
- Error logs show database connection failures

**Solutions:**

1. **Check DATABASE_URL is set:**
   - Go to Render Dashboard → Your Service → Environment
   - Verify `DATABASE_URL` is set
   - Use the **Internal Database URL** from your PostgreSQL service (not External)

2. **Run Database Migrations:**
   - Go to Render Dashboard → Your Service → Shell
   - Run: `cd web && npm run db:migrate`
   - This creates all necessary tables

3. **Verify Database is Running:**
   - Check PostgreSQL service status in Render
   - Ensure it's not paused

### 2. Missing Environment Variables

**Check these required variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV=production`
- `APP_URL` - Your Render service URL

**Optional but recommended:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GMAIL_USER` / `GMAIL_APP_PASSWORD`
- `STRIPE_SECRET_KEY`
- `SESSION_SECRET`

### 3. Build Issues

**Check build logs:**
- Go to Render Dashboard → Your Service → Logs
- Look for build errors

**Common build issues:**
- Missing dependencies
- Prisma client not generated
- Build command incorrect

**Fix:**
- Ensure build command: `npm install && npm run build:prod`
- Ensure start command: `npm run start:prod`

### 4. Prisma Client Not Generated

**Symptoms:**
- Error: "Cannot find module '@prisma/client'"
- Database queries fail

**Solution:**
- The build command should include `prisma generate`
- Check that `build:prod` script includes: `prisma generate && vite build`

### 5. Port Configuration

**Render automatically sets PORT environment variable**

Your app should listen on `process.env.PORT` or default to a port.

**Check:**
- SvelteKit adapter-node should handle this automatically
- If using custom server, ensure it uses `process.env.PORT || 5173`

## How to Check Logs

1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for error messages

## Common Error Messages

### "Can't reach database server"
- **Cause:** DATABASE_URL incorrect or database not running
- **Fix:** Verify DATABASE_URL and database service status

### "PrismaClientInitializationError"
- **Cause:** Database connection failed or migrations not run
- **Fix:** Check DATABASE_URL and run migrations

### "Module not found: @prisma/client"
- **Cause:** Prisma client not generated
- **Fix:** Ensure build includes `prisma generate`

### "EADDRINUSE: address already in use"
- **Cause:** Port conflict
- **Fix:** Use `process.env.PORT` (Render sets this automatically)

## Step-by-Step Debugging

1. **Check Service Status:**
   - Is the service running?
   - Is the database service running?

2. **Check Environment Variables:**
   - All required variables set?
   - DATABASE_URL correct?

3. **Check Build Logs:**
   - Did build succeed?
   - Any errors during build?

4. **Check Runtime Logs:**
   - What errors appear when accessing the site?
   - Database connection errors?

5. **Run Migrations:**
   - Use Shell to run: `npm run db:migrate`

6. **Test Database Connection:**
   - Use Shell to test: `node -e "require('@prisma/client').PrismaClient"`

## Quick Fixes

### Reset and Redeploy
1. Go to Render Dashboard → Your Service
2. Click "Manual Deploy" → "Clear build cache & deploy"

### Check Database Connection
In Render Shell:
```bash
cd web
node -e "const { PrismaClient } = require('@prisma/client'); const db = new PrismaClient(); db.\$connect().then(() => console.log('Connected!')).catch(e => console.error('Error:', e))"
```

### Verify Environment Variables
In Render Shell:
```bash
echo $DATABASE_URL
echo $NODE_ENV
```

## Still Having Issues?

1. Check Render status page: https://status.render.com
2. Review Render documentation: https://render.com/docs
3. Check application logs for specific error messages
4. Verify all environment variables are set correctly

