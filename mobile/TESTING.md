# Testing Guide for Matcher Mobile App

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Expo CLI** (already installed: `expo`)
3. **Expo Go app** on your phone (for physical device testing)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Step 1: Install Dependencies

```bash
cd /home/juan/Projects/matcher/mobile
npm install
```

This will install all required packages including:
- Expo SDK
- React Navigation
- React Native libraries
- Design system dependencies

## Step 2: Configure Environment Variables

Create a `.env` file in the `mobile/` directory:

```bash
cat > .env << 'EOF'
EXPO_PUBLIC_API_URL=http://localhost:5173
EOF
```

**Important**: Make sure your web app backend is running on `http://localhost:5173` (or update the URL to match your backend).

## Step 3: Create Placeholder Assets

The app needs some basic assets. Create placeholder images:

```bash
# Create simple placeholder images (you can replace these later with actual assets)
# For now, we'll use a simple approach - create empty files that Expo can handle
mkdir -p assets
touch assets/icon.png assets/splash.png assets/adaptive-icon.png assets/favicon.png
```

**Note**: For production, you'll need actual images:
- `icon.png`: 1024x1024 app icon
- `splash.png`: 1242x2436 splash screen
- `adaptive-icon.png`: 1024x1024 Android adaptive icon
- `favicon.png`: 48x48 web favicon

## Step 4: Start the Development Server

### Option A: Start Expo Dev Server (Recommended)

```bash
npm start
```

This will:
1. Start the Metro bundler
2. Open Expo DevTools in your browser
3. Show a QR code for testing on physical devices

### Option B: Run on Specific Platform

**iOS Simulator** (macOS only):
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

**Web Browser**:
```bash
npm run web
```

## Step 5: Test on Physical Device

### Using Expo Go App

1. **Start the dev server**: `npm start`
2. **Scan QR code**:
   - **iOS**: Open Camera app and scan the QR code
   - **Android**: Open Expo Go app and tap "Scan QR code"
3. The app will load on your device

### Using Development Build (Advanced)

For testing features that require native code (like push notifications, AdMob), you'll need to create a development build:

```bash
# iOS
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

## Testing Checklist

### ✅ Basic Functionality

- [ ] App launches without errors
- [ ] Theme system works (light/dark mode toggle)
- [ ] Navigation works (bottom tabs, stack navigation)
- [ ] Login/Signup screens display correctly
- [ ] Home screen shows swipe cards
- [ ] Swipe gestures work (left/right)
- [ ] Action buttons work (like/dislike)
- [ ] Matches list displays
- [ ] Chat screen works
- [ ] Settings screen works

### ✅ API Integration

- [ ] Can connect to backend API
- [ ] Authentication works (login/signup)
- [ ] Can fetch user cards
- [ ] Can send swipes
- [ ] Can load matches
- [ ] Can send/receive messages
- [ ] Settings save to backend

### ✅ Design System

- [ ] Colors match design system
- [ ] Spacing follows 8px grid
- [ ] Typography uses correct fonts
- [ ] Components match specifications
- [ ] Theme switching is smooth

## Common Issues & Solutions

### Issue: "Module not found" errors

**Solution**: 
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

### Issue: "Cannot connect to Metro bundler"

**Solution**:
1. Make sure Metro bundler is running: `npm start`
2. Check firewall settings
3. Ensure device and computer are on same network (for physical device testing)

### Issue: "API request failed"

**Solution**:
1. Verify backend is running: `cd ../web && npm run dev`
2. Check `.env` file has correct `EXPO_PUBLIC_API_URL`
3. Check network connectivity
4. Verify CORS settings on backend allow requests from Expo

### Issue: "TypeScript errors"

**Solution**:
```bash
# Check TypeScript configuration
npx tsc --noEmit

# If design-system imports fail, check tsconfig.json paths
```

### Issue: "Design system tokens not found"

**Solution**:
The app imports from `@design-system/*` which should resolve to `../design-system/`. Verify:
1. `tsconfig.json` has correct paths configuration
2. Design system folder exists at `../design-system/`
3. Token files exist (colors.js, spacing.js, typography.js)

## Testing on Different Platforms

### iOS (macOS only)

1. Install Xcode from App Store
2. Install iOS Simulator:
   ```bash
   xcode-select --install
   ```
3. Run: `npm run ios`

### Android

1. Install Android Studio
2. Set up Android Emulator:
   - Open Android Studio
   - Tools → Device Manager
   - Create Virtual Device
3. Run: `npm run android`

### Web

Simply run: `npm run web`

**Note**: Some features may not work on web (geolocation, push notifications, native modules).

## Debugging Tips

### Enable Debug Menu

- **iOS Simulator**: Cmd + D
- **Android Emulator**: Cmd + M (Mac) or Ctrl + M (Windows/Linux)
- **Physical Device**: Shake device

### View Logs

```bash
# In terminal where `npm start` is running
# Or use Expo DevTools in browser
```

### React Native Debugger

Install React Native Debugger for advanced debugging:
```bash
# macOS
brew install --cask react-native-debugger

# Then enable remote debugging in app
```

## Performance Testing

1. **Check bundle size**: Expo will show bundle size in terminal
2. **Monitor performance**: Use React DevTools Profiler
3. **Test on low-end devices**: Use older simulators/emulators
4. **Check memory usage**: Monitor in device settings

## Next Steps

After basic testing works:
1. Implement geolocation feature
2. Add push notifications
3. Integrate AdMob
4. Add Stripe subscription flow
5. Test on real devices
6. Prepare for production build

## Quick Start Commands

```bash
# Full setup (first time)
cd /home/juan/Projects/matcher/mobile
npm install
echo "EXPO_PUBLIC_API_URL=http://localhost:5173" > .env
npm start

# Daily development
npm start

# Clear cache if issues
npm start -- --clear
```

