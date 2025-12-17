# Fixing "Failed to download update" Error

This error means Expo Go cannot download the JavaScript bundle from Metro bundler.

## Immediate Solutions

### Solution 1: Use LAN Mode (Most Reliable)

Tunnel mode is often unreliable. Switch to LAN mode:

```bash
cd /home/juan/Projects/matcher/mobile

# Stop current Metro bundler (Ctrl+C if running)

# Start with LAN mode
npm run start:lan --clear
```

**Requirements**:
- ✅ Phone and computer on same Wi-Fi network
- ✅ Firewall allows port 8081
- ✅ No VPN blocking connection

### Solution 2: Check Metro Bundler is Running

1. **Verify Metro is running**:
   ```bash
   # Should see "Metro waiting on..." message
   npm run start:lan
   ```

2. **Test Metro accessibility**:
   - From your phone's browser, try: `http://192.168.100.109:8081/status`
   - Should return JSON with Metro status
   - If it doesn't work, firewall is blocking

### Solution 3: Check Firewall

```bash
# Allow port 8081
sudo ufw allow 8081/tcp

# Or check firewall status
sudo ufw status
```

### Solution 4: Manual Connection in Expo Go

Instead of scanning QR code:
1. Open Expo Go
2. Tap "Enter URL manually"
3. Enter: `exp://192.168.100.109:8081`
4. Tap "Connect"

## Why This Happens

1. **Tunnel mode instability**: Expo's tunnel servers can be unreliable
2. **Large bundle size**: Your app has many dependencies, making the bundle large
3. **Network issues**: Unstable connection between phone and computer
4. **Firewall blocking**: Port 8081 might be blocked

## Step-by-Step Fix

1. **Stop Metro bundler** (if running): Press Ctrl+C

2. **Clear all caches**:
   ```bash
   rm -rf .expo node_modules/.cache
   ```

3. **Start with LAN mode**:
   ```bash
   npm run start:lan --clear
   ```

4. **Verify phone and computer are on same Wi-Fi**:
   - Check Wi-Fi network name on both devices
   - They must match exactly

5. **Check firewall**:
   ```bash
   sudo ufw allow 8081/tcp
   ```

6. **Scan QR code again** or use manual connection

## If LAN Mode Doesn't Work

### Try Different Network
- Switch to a different Wi-Fi network
- Try mobile hotspot (connect computer to phone's hotspot)

### Check Metro Bundler Logs
Look in the terminal where Metro is running for:
- Any error messages
- "Metro waiting on..." confirmation
- Bundle size warnings

### Reduce Bundle Size (Last Resort)
If bundle is too large:
1. Remove unused dependencies
2. Use code splitting
3. Consider creating a development build instead of Expo Go

## Development Build Alternative

If Expo Go keeps failing, create a development build:

```bash
# Prebuild native code
npx expo prebuild

# Run on device
npx expo run:android  # or run:ios
```

This creates a standalone app that doesn't rely on Expo Go's limitations.

## Your Network Info

- **Computer IP**: `192.168.100.109`
- **Metro Port**: `8081`
- **Connection URL**: `exp://192.168.100.109:8081`

## Quick Checklist

- [ ] Metro bundler is running
- [ ] Phone and computer on same Wi-Fi
- [ ] Firewall allows port 8081
- [ ] Using LAN mode (not tunnel)
- [ ] Cleared all caches
- [ ] Tried manual connection URL

If all checked and still failing, try a different network or create a development build.

