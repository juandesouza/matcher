# Production Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Environment Setup
- [ ] All environment variables configured in production `.env`
- [ ] `NODE_ENV=production` set
- [ ] Database connection string configured
- [ ] Google OAuth credentials (production) configured
- [ ] Stripe keys switched to live mode
- [ ] Email service configured (SMTP)
- [ ] Session secret generated and set
- [ ] CORS origins restricted to production domains

### Security
- [ ] HTTPS enabled
- [ ] Secure cookies enabled (`secure: true` in Lucia config)
- [ ] CSRF protection enabled
- [ ] Rate limiting configured (if applicable)
- [ ] Firewall rules configured
- [ ] Secrets stored securely (not in code)
- [ ] `.env` file excluded from git

### Database
- [ ] Production database created
- [ ] Database migrations run (`npm run db:migrate`)
- [ ] Prisma client generated
- [ ] Database backups configured
- [ ] Connection pooling configured

### Application
- [ ] Production build successful (`npm run build:prod`)
- [ ] All tests passing
- [ ] No console errors
- [ ] Error logging configured
- [ ] Monitoring set up

### Mobile App
- [ ] API URL updated to production
- [ ] Stripe publishable key updated
- [ ] Google Mobile Ads configured (if using)
- [ ] App builds successfully
- [ ] Deep links configured

## Deployment Steps

### 1. Server Setup
- [ ] Server provisioned (VPS, cloud, etc.)
- [ ] Node.js 18+ installed
- [ ] Docker installed (if using)
- [ ] nginx/reverse proxy configured
- [ ] SSL certificate installed (Let's Encrypt)

### 2. Application Deployment
- [ ] Code deployed to server
- [ ] Dependencies installed (`npm ci`)
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Application built
- [ ] Process manager configured (PM2, systemd, etc.)

### 3. Post-Deployment
- [ ] Application accessible via HTTPS
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] OAuth flows working
- [ ] Email sending working
- [ ] Stripe webhooks configured
- [ ] Mobile app can connect to API

### 4. Monitoring
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring set up
- [ ] Log aggregation configured
- [ ] Performance monitoring enabled

## Testing Checklist

### Authentication
- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] Google OAuth works
- [ ] Password reset works
- [ ] Session persistence works

### Core Features
- [ ] User profiles load
- [ ] Swipe functionality works
- [ ] Matches created correctly
- [ ] Chat messages send/receive
- [ ] Image uploads work
- [ ] Settings save correctly

### Payments
- [ ] Stripe checkout works
- [ ] Webhooks received
- [ ] Subscription status updates
- [ ] Ad removal works for subscribers

### Mobile App
- [ ] App connects to production API
- [ ] All features work on iOS
- [ ] All features work on Android
- [ ] Deep links work
- [ ] Push notifications work (if configured)

## Rollback Plan

- [ ] Previous version tagged in git
- [ ] Database backup before deployment
- [ ] Rollback procedure documented
- [ ] Team notified of deployment

## Post-Deployment

- [ ] Monitor error logs for 24 hours
- [ ] Check application performance
- [ ] Verify all features working
- [ ] Update documentation if needed
- [ ] Notify users of deployment (if applicable)

## Emergency Contacts

- [ ] Database admin contact
- [ ] Server admin contact
- [ ] Development team contacts
- [ ] Hosting provider support

## Notes

Add any deployment-specific notes here:

