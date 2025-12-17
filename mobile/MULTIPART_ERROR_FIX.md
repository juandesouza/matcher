# Fixing "Error while reading multipart response" Error

This error occurs when Metro bundler's response is interrupted or too large for the connection.

## Quick Fixes

### 1. Try LAN Mode Instead of Tunnel
Tunnel mode can be unreliable for large bundles. Try LAN mode:

```bash
cd /home/juan/Projects/matcher/mobile
npm run start:lan --clear
```

**Requirements**:
- Phone and computer must be on the same Wi-Fi network
- Firewall must allow port 8081

### 2. Clear All Caches
```bash
cd /home/juan/Projects/matcher/mobile
rm -rf .expo node_modules/.cache
npm run start:tunnel --clear
```

### 3. Reduce Bundle Size
The bundle might be too large. Try:
- Close other apps on your phone
- Use a faster network connection
- Try on a different device

### 4. Use Development Build Instead of Expo Go
Expo Go has limitations with large bundles. Consider creating a development build:

```bash
npx expo prebuild
npx expo run:android  # or run:ios
```

## What Changed

I've updated `metro.config.js` to:
- Increase timeout to 5 minutes for large bundles
- Better handle multipart responses
- Improved error handling

## Alternative: Use LAN Mode

If tunnel mode keeps failing, LAN mode is more reliable:

1. **Make sure phone and computer are on same Wi-Fi**
2. **Start with LAN mode**:
   ```bash
   npm run start:lan --clear
   ```
3. **Scan QR code** - should work more reliably

## If Still Failing

1. **Check your network**: Try a different Wi-Fi network
2. **Restart everything**: 
   - Stop Metro bundler
   - Close Expo Go app
   - Restart Metro: `npm run start:lan --clear`
   - Reopen Expo Go and scan QR code
3. **Check Metro bundler logs**: Look for any errors in the terminal

## Why This Happens

- Large JavaScript bundles (your app has many dependencies)
- Network instability (especially with tunnel mode)
- Timeout issues (bundle takes too long to download)
- Expo Go limitations with very large bundles

The Metro config update should help, but LAN mode is usually more reliable than tunnel mode for large bundles.

