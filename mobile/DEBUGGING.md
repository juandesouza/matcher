# Debugging Expo Go Errors

## Common Issues and Solutions

### 1. "Something went wrong" Error After Scanning QR Code

This usually indicates one of these issues:

#### A. Path Alias Resolution (Most Common)
**Symptom**: Error about `@design-system/*` imports not being found

**Solution**: 
1. Install babel-plugin-module-resolver:
   ```bash
   npm install
   ```

2. Clear Metro cache and restart:
   ```bash
   npx expo start --clear
   ```

#### B. Missing Assets
**Symptom**: Errors about missing icon.png, splash.png, etc.

**Solution**: Placeholder assets have been created. If issues persist, ensure all required assets exist in `assets/` directory.

#### C. Syntax Errors in Code
**Symptom**: Red error screen in Expo Go

**Solution**: 
1. Check Metro bundler terminal output for specific error messages
2. Look for TypeScript/JavaScript syntax errors
3. Verify all imports are correct

#### D. Missing Dependencies
**Symptom**: Module not found errors

**Solution**:
```bash
npm install
npx expo start --clear
```

## Debugging Steps

1. **Check Metro Bundler Output (PRIMARY SOURCE)**
   - **This is where most errors will appear!**
   - Look at the terminal where `npm start` or `expo start` is running
   - Check for red error messages
   - Look for module resolution errors
   - Errors will now appear with clear markers:
     - `========== ERROR BOUNDARY CAUGHT ERROR ==========`
     - `========== GLOBAL ERROR HANDLER ==========`
   - Scroll up in the terminal to see full error stack traces

2. **Check Error Screen on Device**
   - The app now has an error boundary that shows errors on screen
   - You'll see the error message and stack trace directly in the app
   - The error screen will tell you to check the Metro bundler terminal

3. **Check Expo Go Logs**
   - Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android) in simulator
   - Select "Show Dev Menu"
   - Check "Debug Remote JS" for console errors
   - Enable "Remote JS Debugging" to see console.log/console.error in browser DevTools

3. **Clear All Caches**
   ```bash
   # Clear Metro cache
   npx expo start --clear
   
   # Clear npm cache (if needed)
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules
   npm install
   ```

4. **Verify Configuration**
   - Check `babel.config.js` has `module-resolver` plugin
   - Check `tsconfig.json` has path aliases
   - Check `metro.config.js` exists

5. **Check Network Connection**
   - Ensure device and computer are on same network
   - Try using tunnel mode: `npx expo start --tunnel`

### E. Network Connection Error (Most Common for Physical Devices)
**Symptom**: "Failed to download remote update" or "Cannot connect to Metro bundler"

**Solution**: 
1. **Use tunnel mode** (recommended - works from any network):
   ```bash
   npm run start:tunnel
   ```
   Then scan the QR code again.

2. **Or use LAN mode** (if on same network):
   ```bash
   npm run start:lan
   ```

3. **Check firewall** - Make sure port 8081 is not blocked

See `NETWORK_FIX.md` for detailed network troubleshooting.

## Current Configuration

- **Babel**: Configured with `module-resolver` for `@design-system/*` aliases
- **Metro**: Using default Expo config
- **TypeScript**: Path aliases configured in `tsconfig.json`
- **Assets**: Placeholder assets created
- **Error Handling**: Error boundary and global error handler added to log all errors to Metro bundler terminal

## Where to Find Error Messages

### Primary Location: Metro Bundler Terminal
**This is the most important place to check!**

When you run `npm start` or `expo start`, errors will appear in that terminal with clear markers:
- Look for lines starting with `========== ERROR BOUNDARY CAUGHT ERROR ==========`
- Look for lines starting with `========== GLOBAL ERROR HANDLER ==========`
- Scroll up in the terminal to see the full error message and stack trace

### Secondary Locations:
1. **On your phone**: The error screen will show a basic error message
2. **Expo Dev Menu**: Shake device → "Show Dev Menu" → "Debug Remote JS" (opens browser console)
3. **React Native Debugger**: If you have it installed, it will show console logs

## Next Steps After Fix

1. Install dependencies: `npm install`
2. Clear cache: `npx expo start --clear`
3. Scan QR code again in Expo Go
4. Check terminal for any remaining errors

