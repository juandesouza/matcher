# Matcher - Dating PWA

A Tinder-style Progressive Web App built with SvelteKit.

## Features

- 🎯 Swipe-based matching system
- 💬 Real-time chat with media support
- 📱 Full PWA support (offline, installable)
- 🎨 Dark/light theme
- 💳 Stripe subscription integration
- 📊 Google AdSense integration
- 🔐 OAuth and email authentication

## Tech Stack

- **Frontend**: SvelteKit, Tailwind CSS, Skeleton UI
- **Backend**: SvelteKit API routes
- **Database**: (To be configured - Prisma recommended)
- **Payments**: Stripe
- **Ads**: Google AdSense
- **Hosting**: Render

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
ADSENSE_PUBLISHER_ID=your-adsense-publisher-id
```

3. Run development server:
```bash
npm run dev
```

## Project Structure

```
web/
├── src/
│   ├── lib/
│   │   ├── components/    # Reusable components
│   │   ├── stores/        # Svelte stores
│   │   └── utils/         # Utility functions
│   ├── routes/
│   │   ├── api/           # API endpoints
│   │   ├── auth/          # Authentication pages
│   │   ├── chat/          # Chat pages
│   │   ├── matches/       # Match pages
│   │   └── settings/      # Settings page
│   └── service-worker.js  # PWA service worker
├── static/                # Static assets
└── design-system/         # Shared design tokens
```

## Deployment

### Render Setup

1. Connect your repository to Render
2. Create a new Web Service
3. Set build command: `npm run build`
4. Set start command: `node build/index.js`
5. Add environment variables

## License

MIT
