# Fixing "Failed to download remote update" Error

This error means Expo Go on your phone can't connect to the Metro bundler on your computer.

## Quick Fix: Use Tunnel Mode

The easiest solution is to use Expo's tunnel mode, which works even if your phone and computer are on different networks:

```bash
cd /home/juan/Projects/matcher/mobile
npm run start:tunnel
```

Then scan the QR code again. Tunnel mode uses Expo's servers to relay the connection, so it works from anywhere.

## Alternative Solutions

### Option 1: Use LAN Mode (Same Network Required)

If your phone and computer are on the same Wi-Fi network:

```bash
npm run start:lan
```

**Important**: Make sure:
- Phone and computer are on the same Wi-Fi network
- Firewall allows connections on port 8081 (Metro bundler port)
- No VPN is blocking the connection

### Option 2: Check Network Connection

1. **Verify same network**:
   - Check your computer's IP: `ip addr show | grep "inet " | grep -v "127.0.0.1"`
   - Your computer's IP should be something like `192.168.x.x`
   - Make sure your phone is on the same Wi-Fi network

2. **Check firewall**:
   ```bash
   # On Linux, allow port 8081
   sudo ufw allow 8081/tcp
   # Or check if firewall is blocking
   sudo ufw status
   ```

3. **Try manual connection**:
   - In Expo Go, instead of scanning QR code, try "Enter URL manually"
   - Enter: `exp://YOUR_COMPUTER_IP:8081`
   - Replace `YOUR_COMPUTER_IP` with your computer's IP address (e.g., `192.168.100.109`)

### Option 3: Check Metro Bundler is Running

Make sure Metro bundler is actually running and accessible:

1. Check if Metro is running:
   ```bash
   # Should see Metro bundler output
   npm start
   ```

2. Test if Metro is accessible:
   ```bash
   # From your phone's browser, try accessing:
   # http://YOUR_COMPUTER_IP:8081/status
   # Should return JSON with Metro status
   ```

## Common Issues

### Issue: "Connection refused"
**Solution**: Firewall is blocking. Allow port 8081 or use tunnel mode.

### Issue: "Network timeout"
**Solution**: 
- Phone and computer are on different networks → Use tunnel mode
- VPN is interfering → Disable VPN or use tunnel mode
- Network is blocking → Use tunnel mode

### Issue: "Cannot connect to Metro bundler"
**Solution**:
1. Make sure `npm start` is running
2. Check the terminal shows "Metro waiting on..."
3. Try tunnel mode: `npm run start:tunnel`

## Recommended: Always Use Tunnel Mode

For the most reliable connection, especially when testing on physical devices:

```bash
npm run start:tunnel
```

Tunnel mode:
- ✅ Works from any network
- ✅ Bypasses firewall issues
- ✅ Works with VPNs
- ✅ More reliable for testing

The only downside is it's slightly slower, but for development it's usually fine.

## Your Computer's IP Address

Based on your system, your computer's IP is likely: `192.168.100.109`

You can verify with:
```bash
ip addr show | grep "inet " | grep -v "127.0.0.1"
```

## Next Steps

1. **Try tunnel mode first** (easiest):
   ```bash
   npm run start:tunnel
   ```

2. **If tunnel doesn't work**, check:
   - Internet connection (tunnel needs internet)
   - Expo account (may need to sign in)
   - Try LAN mode if on same network

3. **If still not working**, check:
   - Metro bundler is actually running
   - No other process using port 8081
   - Try restarting Metro: `npm start -- --clear`

