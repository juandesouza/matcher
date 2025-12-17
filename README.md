# Matcher - Dating App

A modern dating application built with React Native (Expo) for mobile and SvelteKit for web/backend.

## Features

- 🔐 Authentication (Email/Password + Google OAuth)
- 👤 User profiles with photos and bio
- 💌 Swipe-based matching system
- 💬 Real-time chat with image support
- 💳 Subscription system with Stripe
- 📱 Native mobile apps (iOS & Android)
- 🌐 Progressive Web App (PWA)
- 🎨 Dark/Light theme support

## Tech Stack

### Mobile
- React Native with Expo
- TypeScript
- React Navigation
- Expo AuthSession (Google OAuth)
- Stripe React Native

### Backend/Web
- SvelteKit (full-stack)
- PostgreSQL with Prisma ORM
- Lucia Auth
- Stripe
- Nodemailer

## Project Structure

```
matcher/
├── mobile/          # React Native mobile app
├── web/             # SvelteKit backend/frontend
└── design-system/   # Shared design tokens
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for local database)
- Expo CLI (for mobile development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/matcher.git
   cd matcher
   ```

2. **Setup Backend**
   ```bash
   cd web
   npm install
   cp .env.example .env  # Edit with your configuration
   npm run dev:full      # Starts database and server
   ```

3. **Setup Mobile App**
   ```bash
   cd mobile
   npm install
   cp .env.example .env  # Edit with your API URL
   npm start
   ```

### Environment Variables

See `DEPLOYMENT.md` for detailed environment variable configuration.

## Development

### Backend Development

```bash
cd web
npm run dev:full  # Starts database + server
npm run dev       # Server only
npm run build     # Production build
```

### Mobile Development

```bash
cd mobile
npm start         # Start Expo dev server
npm run android   # Run on Android
npm run ios       # Run on iOS
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

Quick start:
```bash
cd web
npm run build:prod
npm run start:prod
```

## Database

The application uses PostgreSQL. For local development, a Docker container is provided:

```bash
cd web
docker-compose up -d postgres
```

Migrations are handled by Prisma:
```bash
cd web
npm run db:migrate
npm run db:generate
```

## API Documentation

The API is RESTful and follows these conventions:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/check` - Check authentication status
- `GET /api/users/cards` - Get swipeable user cards
- `POST /api/swipes` - Record swipe action
- `GET /api/matches` - Get user matches
- `GET /api/chat/[id]` - Get chat messages
- `POST /api/chat/[id]` - Send message

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
