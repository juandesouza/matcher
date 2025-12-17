# Creating a Development Build (Recommended Solution)

Expo Go has limitations with large bundles. A development build creates a standalone app that doesn't have these limitations.

## Why Development Build?

- ✅ No bundle size limitations
- ✅ Can use custom native code
- ✅ More reliable than Expo Go
- ✅ Better performance
- ✅ Can test features Expo Go doesn't support

## Quick Start

### For Android:

```bash
cd /home/juan/Projects/matcher/mobile

# Prebuild native code
npx expo prebuild

# Run on connected Android device or emulator
npx expo run:android
```

### For iOS (macOS only):

```bash
cd /home/juan/Projects/matcher/mobile

# Prebuild native code
npx expo prebuild

# Run on connected iOS device or simulator
npx expo run:ios
```

## What This Does

1. **Prebuild**: Generates native Android/iOS projects
2. **Build**: Compiles the native app
3. **Install**: Installs on your device
4. **Start**: Starts Metro bundler and connects the app

## Requirements

### Android:
- Android Studio installed
- Android device connected via USB (with USB debugging enabled)
- OR Android emulator running

### iOS:
- macOS with Xcode installed
- iOS device connected (with developer mode enabled)
- OR iOS Simulator

## After Building

Once the app is installed:
- The app will automatically connect to Metro bundler
- You can reload with `r` in Metro terminal
- Changes will hot reload automatically

## Advantages Over Expo Go

1. **No bundle size limits** - Can handle large apps
2. **Custom native code** - Full access to native features
3. **Better performance** - Native compilation
4. **More reliable** - No network download issues
5. **Production-like** - Closer to final app experience

## Troubleshooting

### "Command not found: expo"
```bash
npm install -g expo-cli
# Or use: npx expo
```

### "Android SDK not found"
- Install Android Studio
- Set ANDROID_HOME environment variable

### "Xcode not found" (iOS)
- Install Xcode from App Store
- Run: `xcode-select --install`

## Next Steps

After creating the development build:
1. App will be installed on your device
2. Metro bundler will start automatically
3. App will connect and load your code
4. You can develop normally with hot reload

This is the recommended solution for apps that are too large for Expo Go!

