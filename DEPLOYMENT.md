# Matcher - Production Deployment Guide

This guide covers deploying the Matcher application to production.

## Architecture

- **Backend/Frontend**: SvelteKit (full-stack) in `web/` folder
- **Mobile App**: React Native with Expo in `mobile/` folder
- **Database**: PostgreSQL (Docker container)

## Prerequisites

1. Node.js 18+ and npm
2. Docker and Docker Compose
3. PostgreSQL database (local or cloud)
4. Domain name with SSL certificate (for production)
5. Google Cloud Console account (for OAuth)
6. Stripe account (for payments)
7. Email service (SMTP or Gmail)

## Environment Variables

### Backend (web/.env)

Create `web/.env` with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Application
APP_URL="https://yourdomain.com"
NODE_ENV="production"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="https://yourdomain.com/api/auth/google/callback"

# Email (SMTP recommended for production)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Security
SESSION_SECRET="generate-with-openssl-rand-base64-32"
CORS_ORIGINS="https://yourdomain.com"
```

### Mobile App (mobile/.env)

Create `mobile/.env` with:

```bash
EXPO_PUBLIC_API_URL="https://api.yourdomain.com"
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_publishable_key"
EXPO_PUBLIC_GOOGLE_MOBILE_ADS_APP_ID="ca-app-pub-..."
```

## Production Build Steps

### 1. Database Setup

```bash
cd web
docker-compose up -d postgres  # Or use cloud PostgreSQL
npm run db:migrate  # Run migrations
```

### 2. Build Backend

```bash
cd web
npm install
npm run build:prod
```

### 3. Start Production Server

```bash
cd web
npm run start:prod
```

Or use a process manager like PM2:

```bash
npm install -g pm2
pm2 start build/index.js --name matcher-api
pm2 save
pm2 startup
```

### 4. Build Mobile App

```bash
cd mobile
npm install
npx expo build:android  # For Android
npx expo build:ios      # For iOS
```

## Deployment Options

### Option 1: VPS/Server (Recommended)

1. **Setup Server**
   - Ubuntu 20.04+ or similar
   - Install Node.js, Docker, nginx

2. **Configure nginx** (reverse proxy)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **SSL Certificate** (Let's Encrypt)
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

4. **Deploy Application**
   ```bash
   git clone https://github.com/yourusername/matcher.git
   cd matcher/web
   npm install
   npm run build:prod
   npm run start:prod
   ```

### Option 2: Platform as a Service (PaaS)

#### Render.com

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `cd web && npm install && npm run build:prod`
4. Set start command: `cd web && npm run start:prod`
5. Add environment variables
6. Add PostgreSQL database service

#### Railway.app

1. Create new project
2. Connect GitHub repository
3. Add PostgreSQL service
4. Configure environment variables
5. Deploy

#### Heroku

1. Create Heroku app
2. Add PostgreSQL addon
3. Set buildpacks
4. Configure environment variables
5. Deploy

### Option 3: Docker Deployment

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: matcher_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: matcher_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build:
      context: ./web
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://matcher_user:${DB_PASSWORD}@postgres:5432/matcher_db
      NODE_ENV: production
    ports:
      - "5173:5173"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure session cookies
- [ ] Enable CORS only for your domains
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database backups
- [ ] Monitor logs and errors

## Database Migrations

```bash
cd web
npm run db:migrate  # Run pending migrations
npm run db:generate  # Generate Prisma client
```

## Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor database performance
- Set up uptime monitoring
- Configure log aggregation

## Backup Strategy

1. **Database Backups**
   ```bash
   pg_dump -U matcher_user matcher_db > backup.sql
   ```

2. **Automated Backups**
   - Use cron jobs or cloud backup services
   - Store backups off-site

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check firewall rules
- Ensure database is running

### OAuth Issues
- Verify redirect URIs match exactly
- Check Google Cloud Console settings
- Ensure HTTPS is enabled

### Build Failures
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Review build logs

## Support

For issues or questions, please open an issue on GitHub.

