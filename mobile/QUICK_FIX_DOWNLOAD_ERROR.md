# Quick Fix: "Failed to download update" Error

## The Problem
Expo Go can't download the JavaScript bundle from Metro bundler. This is usually because tunnel mode is unreliable for large bundles.

## The Solution: Use LAN Mode

**Stop your current Metro bundler** (Ctrl+C), then run:

```bash
cd /home/juan/Projects/matcher/mobile
npm run start:lan --clear
```

## Requirements for LAN Mode

1. **Same Wi-Fi Network**: Phone and computer must be on the same Wi-Fi
2. **Firewall**: Allow port 8081
   ```bash
   sudo ufw allow 8081/tcp
   ```
3. **No VPN**: Disable VPN if active

## Alternative: Manual Connection

If QR code doesn't work:
1. Open Expo Go
2. Tap "Enter URL manually"
3. Enter: `exp://192.168.100.109:8081`
4. Tap "Connect"

## Why LAN Mode Works Better

- ✅ Direct connection (no tunnel servers)
- ✅ Faster download
- ✅ More reliable for large bundles
- ✅ No dependency on Expo's tunnel infrastructure

## If Still Failing

1. **Check Metro is running**: Should see "Metro waiting on..." in terminal
2. **Verify same network**: Check Wi-Fi name on both devices
3. **Test connection**: From phone browser, try `http://192.168.100.109:8081/status`
4. **Try different network**: Switch Wi-Fi or use mobile hotspot

LAN mode should resolve the download error!

