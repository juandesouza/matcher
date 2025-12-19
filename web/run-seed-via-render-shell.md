# Running Seed via Render Shell

Since direct database connection from local machine is not working, use Render's Shell feature:

## Steps:

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your **web service** (matcher)
3. Click on the **"Shell"** tab
4. Run these commands:

```bash
cd web
npx prisma generate
npx prisma db seed
```

This will:
- Run on Render's infrastructure (no memory limit issues)
- Use the internal database connection (no SSL/network issues)
- Delete existing fake users and create 2 men + 2 women

## Alternative: Wait for Service to Restart

The service might be restarting after the memory issue. Once it's back up, you can also use the API endpoint:

```bash
cd web
node seed-render-api.js
```

But the Shell method is more reliable and avoids memory issues.

