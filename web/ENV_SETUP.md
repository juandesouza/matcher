# Environment Variables Setup Guide

This document explains all environment variables needed for the Matcher application.

## Backend Environment Variables (web/.env)

Create a `.env` file in the `web/` directory with the following variables:

### Database

```bash
# PostgreSQL connection string
# Format: postgresql://user:password@host:port/database
# Local: postgresql://matcher_user:matcher_password@localhost:5432/matcher_db
# Production: postgresql://user:password@your-db-host:5432/matcher_db
DATABASE_URL="postgresql://matcher_user:matcher_password@localhost:5432/matcher_db"
```

### Application

```bash
# Base URL of your application
# Development: http://localhost:5173
# Production: https://yourdomain.com
APP_URL="http://localhost:5173"

# Environment
# Options: development, production
NODE_ENV="development"
```

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - Development: `http://localhost:5173/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`
   - Mobile: `https://auth.expo.dev/@your-expo-username/matcher`

```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:5173/api/auth/google/callback"
```

### Email Configuration

#### Option 1: SMTP (Recommended for Production)

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

#### Option 2: Gmail App Password (Development)

1. Enable 2-Step Verification on your Google Account
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password

```bash
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
```

### Stripe (Payment Processing)

1. Sign up at [Stripe](https://stripe.com)
2. Get your API keys from [Dashboard](https://dashboard.stripe.com/apikeys)
3. Set up webhook endpoint: `https://yourdomain.com/api/subscribe/webhook`

```bash
# Secret key (starts with sk_live_ for production, sk_test_ for development)
STRIPE_SECRET_KEY="sk_test_your_secret_key"

# Publishable key (starts with pk_live_ for production, pk_test_ for development)
STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"

# Webhook secret (get from Stripe Dashboard → Webhooks)
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
```

### Security

```bash
# Session secret for secure cookies
# Generate with: openssl rand -base64 32
SESSION_SECRET="your-random-32-char-secret"

# CORS allowed origins (comma-separated)
# Development: http://localhost:5173,http://localhost:8081
# Production: https://yourdomain.com
CORS_ORIGINS="http://localhost:5173,http://localhost:8081"
```

## Mobile App Environment Variables (mobile/.env)

Create a `.env` file in the `mobile/` directory:

```bash
# Backend API URL
# Development: http://YOUR_LOCAL_IP:5173
#   Get your IP: ip addr show | grep "inet " | grep -v "127.0.0.1"
# Production: https://api.yourdomain.com
EXPO_PUBLIC_API_URL="http://192.168.100.110:5173"

# Stripe Publishable Key (same as backend)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_publishable_key"

# Google Mobile Ads (Optional)
# Get from: https://apps.admob.com/
EXPO_PUBLIC_GOOGLE_MOBILE_ADS_APP_ID="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
```

## Security Best Practices

1. **Never commit `.env` files** - They are in `.gitignore`
2. **Use different keys for development and production**
3. **Rotate secrets regularly**
4. **Use strong, random session secrets**
5. **Enable HTTPS in production**
6. **Restrict CORS origins in production**

## Generating Secrets

### Session Secret
```bash
openssl rand -base64 32
```

### Database Password
```bash
openssl rand -base64 24
```

## Verifying Configuration

After setting up environment variables, verify they're loaded:

```bash
cd web
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing')"
```

## Troubleshooting

### "Environment variable not found"
- Ensure `.env` file exists in the correct directory
- Check for typos in variable names
- Restart the server after changing `.env`

### "Database connection failed"
- Verify `DATABASE_URL` format is correct
- Check database is running
- Verify credentials

### "OAuth redirect_uri_mismatch"
- Ensure redirect URI in `.env` matches Google Cloud Console exactly
- Check for trailing slashes
- Verify protocol (http vs https)

