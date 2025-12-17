# Matcher Mobile App

React Native mobile app for Matcher, built with Expo and TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file in the root directory:
```
EXPO_PUBLIC_API_URL=http://localhost:5173
```

3. Start the development server:
```bash
npm start
```

## Project Structure

```
mobile/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation setup
│   ├── theme/          # Theme context and provider
│   ├── types/          # TypeScript type definitions
│   └── utils/          # API client and utilities
├── App.tsx             # Main app entry point
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## Features

- ✅ Theme system (light/dark mode)
- ✅ Navigation (Stack + Bottom Tabs)
- ✅ Swipe cards with gestures
- ✅ Authentication flow
- ✅ Settings with auto-save
- ✅ Chat interface
- ⏳ Geolocation (in progress)
- ⏳ Push notifications (pending)
- ⏳ AdMob integration (pending)
- ⏳ Stripe subscription (pending)

## Design System

The app uses the shared design system from `../design-system/`:
- Colors: Brand colors and theme-aware colors
- Spacing: 8px grid system
- Typography: Inter font family
- Components: Following design system specifications

## Development

### Running on iOS
```bash
npm run ios
```

### Running on Android
```bash
npm run android
```

### Running on Web
```bash
npm run web
```

## API Integration

The app connects to the web app's API. Make sure the web server is running on the configured URL.

## Notes

- The app uses Expo Router for navigation (configured but using React Navigation for now)
- Design tokens are imported from the shared design-system folder
- All API calls go through the centralized API client in `src/utils/api.ts`
