# Troubleshooting "Failed to download update" Error

If you're still getting this error even with LAN mode, try these steps:

## Step 1: Verify Metro is Bundling Successfully

When you run `npm run start:lan --clear`, watch the terminal output. You should see:

```
Metro waiting on exp://192.168.100.109:8081
```

Then when you scan the QR code, you should see:
```
Bundling JavaScript bundle...
Bundled X modules in Yms
```

**If you see errors during bundling**, fix those first.

## Step 2: Test Metro Accessibility

From your phone's browser (not Expo Go), try:
```
http://192.168.100.109:8081/status
```

**Expected**: Should return JSON like `{"status":"running"}`

**If it doesn't work**:
- Firewall is blocking port 8081
- Run: `sudo ufw allow 8081/tcp`
- Or check: `sudo ufw status`

## Step 3: Check Bundle Size

The bundle might be too large. Check the terminal when bundling:
- Look for bundle size warnings
- If bundle is > 10MB, that might be too large for Expo Go

## Step 4: Try Development Build (Recommended)

Expo Go has limitations with large bundles. Create a development build:

```bash
cd /home/juan/Projects/matcher/mobile

# Prebuild native code
npx expo prebuild

# For Android
npx expo run:android

# For iOS (macOS only)
npx expo run:ios
```

This creates a standalone app that doesn't have Expo Go's limitations.

## Step 5: Check for Specific Errors

Look in the Metro bundler terminal for:
- Red error messages
- "Failed to bundle" messages
- Module resolution errors
- Any warnings about bundle size

## Step 6: Nuclear Option - Fresh Start

```bash
cd /home/juan/Projects/matcher/mobile

# Stop Metro (Ctrl+C)

# Clear everything
rm -rf .expo node_modules/.cache .metro

# Reinstall
npm install --legacy-peer-deps

# Start fresh
npm run start:lan --clear
```

## Step 7: Check Network Connection

1. **Verify same network**: 
   - Phone Wi-Fi: Check network name
   - Computer: `ip addr show | grep wlan0` (or your network interface)
   - Must match exactly

2. **Test connectivity**:
   ```bash
   # From computer, ping your phone (if you know its IP)
   # Or from phone browser, try: http://192.168.100.109:8081/status
   ```

3. **Try different network**:
   - Switch to a different Wi-Fi
   - Or use mobile hotspot (connect computer to phone's hotspot)

## Most Likely Solutions

1. **Development Build** - Best solution for large apps
2. **Different Network** - Try mobile hotspot
3. **Firewall** - Make sure port 8081 is open
4. **Bundle Errors** - Check Metro terminal for bundling errors

## Quick Test

To verify Metro is working:
1. Start Metro: `npm run start:lan`
2. From phone browser: `http://192.168.100.109:8081/status`
3. If that works but Expo Go doesn't, it's an Expo Go limitation
4. Solution: Create development build

