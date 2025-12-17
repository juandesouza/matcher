# Local Testing Guide

## Quick Start

### 1. Navigate to the web directory
```bash
cd /home/juan/Projects/matcher/web
```

### 2. Install dependencies (if not already done)
```bash
npm install
```

### 3. Create environment file
```bash
cp .env.example .env
# Or create .env manually
```

### 4. Start development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in terminal)

## Environment Variables

Create a `.env` file in the `web/` directory with these variables:

```env
# JWT Secret for authentication (use a random string for development)
JWT_SECRET=dev-secret-key-change-in-production

# Stripe (optional for testing - can use test keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Google AdSense (optional for testing)
ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXX

# Google OAuth (required for "Continue with Google" button)
VITE_GOOGLE_OAUTH_URL=/api/auth/google
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_REDIRECT_URI=https://your-app.com/api/auth/google/callback
GOOGLE_SCOPES=openid email profile

# Database (optional - app works with mock data for now)
DATABASE_URL=postgresql://user:password@localhost:5432/matcher

# Node Environment
NODE_ENV=development
```

**Note**: For local testing, you can skip Stripe and AdSense keys - the app will work with mock data.

## Testing Features

### 1. Authentication
- Visit `http://localhost:5173`
- You'll be redirected to `/auth/login`
- Use any email/password (currently using mock authentication)
- Or click "Continue with Google" (will need OAuth setup for real testing)

### 2. Swipe Cards
- After login, you'll see swipe cards on the home page
- Swipe left/right or use the buttons
- Cards are loaded from mock data

### 3. Matches
- Navigate to `/matches` to see your matches
- Click on a match to see the match screen

### 4. Chat
- Click on a match to open chat
- Send messages (mock data for now)

### 5. Settings
- Navigate to `/settings`
- Test theme toggle (dark/light)
- Adjust age and distance ranges
- Change language (English, Portuguese, Spanish, French, Italian)
- Test subscription button (will redirect to subscribe page)

### 6. Internationalization
- Change browser language to test auto-detection
- Or use Settings → Language selector
- All text should update immediately

### 7. PWA Features
- Open DevTools → Application → Service Workers
- Check "Offline" to test offline mode
- Test "Add to Home Screen" (mobile or desktop)

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for errors
npm run check

# Watch mode for type checking
npm run check:watch
```

## Testing Different Scenarios

### Test Language Auto-Detection
1. Change your browser language:
   - Chrome: Settings → Languages
   - Firefox: Preferences → Language
2. Clear localStorage: `localStorage.clear()` in console
3. Refresh the page
4. App should detect and use your browser language

### Test Offline Mode
1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Check "Offline"
4. Refresh the page
5. App should work offline (cached content)

### Test PWA Installation
1. In Chrome/Edge: Look for install icon in address bar
2. Click "Install" or "Add to Home Screen"
3. App should install as standalone app

### Test Theme Switching
1. Go to Settings
2. Click theme toggle button
3. Theme should switch between dark/light
4. Preference should persist on refresh

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use a different port
npm run dev -- --port 3000
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### i18n Not Working
- Make sure `src/lib/i18n/index.js` is imported in `+layout.svelte`
- Check browser console for errors
- Verify translation files exist in `src/lib/i18n/locales/`

### Styles Not Loading
- Check that Tailwind is configured in `tailwind.config.js`
- Verify `postcss.config.js` exists
- Restart dev server

## Testing Checklist

- [ ] App starts without errors
- [ ] Login page loads
- [ ] Can "login" (mock auth)
- [ ] Home page shows swipe cards
- [ ] Can swipe cards left/right
- [ ] Matches page loads
- [ ] Chat page loads
- [ ] Settings page loads
- [ ] Theme toggle works
- [ ] Language selector works
- [ ] All languages display correctly
- [ ] Navigation works
- [ ] PWA installable
- [ ] Offline mode works

## Next Steps for Full Testing

1. **Set up Database**: 
   - Install PostgreSQL
   - Run Prisma migrations: `npx prisma migrate dev`
   - Replace mock data with real database queries

2. **Set up Stripe**:
   - Create Stripe test account
   - Get test API keys
   - Test subscription flow

3. **Set up Google OAuth**:
   - Create Google OAuth credentials
   - Configure callback URLs
   - Test Google login

4. **Set up AdSense**:
   - Create AdSense account
   - Get publisher ID
   - Test ad display

## Browser Testing

Test in multiple browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if on Mac)
- Mobile browsers (Chrome, Safari)

## Mobile Testing

1. **Using DevTools**:
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test different device sizes

2. **Using Real Device**:
   - Find your local IP: `ip addr show` or `ifconfig`
   - Start dev server: `npm run dev -- --host`
   - Access from mobile: `http://YOUR_IP:5173`

## Performance Testing

- Open DevTools → Network tab
- Check load times
- Test with slow 3G throttling
- Verify images are lazy-loaded
- Check service worker caching

