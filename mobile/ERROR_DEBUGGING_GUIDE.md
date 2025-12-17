# Error Debugging Guide

## What I've Added

1. **Comprehensive Error Logging**
   - Added logging at every step of app initialization
   - Error boundary catches React component errors
   - Global error handler catches JavaScript errors
   - All errors are logged to the Metro bundler terminal with clear markers

2. **Enhanced Metro Configuration**
   - Updated `metro.config.js` to watch the `design-system` folder
   - This ensures Metro can resolve `@design-system/*` imports correctly

3. **Startup Logging**
   - Logs when the app starts
   - Logs when components render
   - Logs when errors occur

## How to See the Errors

### Step 1: Restart Metro Bundler
```bash
cd /home/juan/Projects/matcher/mobile
npx expo start --clear
```

### Step 2: Watch the Terminal
**The terminal where you run `npx expo start --clear` is where ALL errors will appear.**

Look for these markers:
- `========== APP STARTING ==========`
- `========== App() FUNCTION CALLED ==========`
- `========== ThemeProvider RENDERING ==========`
- `========== AppNavigator RENDERING ==========`
- `========== ERROR BOUNDARY CAUGHT ERROR ==========`
- `========== GLOBAL ERROR HANDLER ==========`

### Step 3: Scan the QR Code Again
After restarting with `--clear`, scan the QR code with Expo Go on your phone.

### Step 4: Check the Terminal Output
Scroll through the terminal output. You should see:
1. Startup logs showing which components are rendering
2. If there's an error, you'll see exactly where it fails
3. The error message and full stack trace

## Common Issues and What to Look For

### Issue: Module Not Found
**Look for**: `Cannot find module '@design-system/...'`
**Solution**: The Metro config should now handle this, but if it persists:
```bash
# Make sure design-system folder exists
ls -la ../design-system/tokens/

# Clear everything and restart
rm -rf node_modules
npm install
npx expo start --clear
```

### Issue: Import Error
**Look for**: `Error: Cannot find module` or `SyntaxError`
**Solution**: Check the file path in the error message and verify the file exists

### Issue: Runtime Error
**Look for**: `TypeError`, `ReferenceError`, or other runtime errors
**Solution**: The error message will show the exact line and component where it fails

### Issue: Network Error
**Look for**: `fetch failed` or `Network request failed`
**Solution**: 
- Make sure your backend is running
- For physical device, use your computer's IP address instead of `localhost`
- Check `.env` file has correct `EXPO_PUBLIC_API_URL`

## What the Logs Will Show

When the app starts, you should see in the terminal:
```
========== APP STARTING ==========
Registering root component...
Root component registered successfully
========== App() FUNCTION CALLED ==========
Global error handler set up
Rendering App component...
========== ThemeProvider RENDERING ==========
ThemeProvider: useEffect called, loading theme...
ThemeProvider: Attempting to load theme from AsyncStorage...
ThemeProvider: Saved theme from storage: null
ThemeProvider: No valid saved theme, using default (dark)
ThemeProvider: Getting theme colors for theme: dark
ThemeProvider: Theme colors loaded successfully
========== AppNavigator RENDERING ==========
AppNavigator: Creating NavigationContainer...
```

If there's an error, you'll see exactly where it stops and what the error is.

## Next Steps

1. **Run the command**: `cd /home/juan/Projects/matcher/mobile && npx expo start --clear`
2. **Watch the terminal** - don't scan the QR code yet
3. **Look for any red error messages** in the terminal
4. **If you see errors before scanning**, those are bundling errors - fix those first
5. **Then scan the QR code** and watch for new errors
6. **Copy the full error message** from the terminal and share it

The error messages will now be very detailed and show exactly what's wrong!

