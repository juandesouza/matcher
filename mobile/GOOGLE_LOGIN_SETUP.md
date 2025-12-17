# Google Login & Signup Improvements

## Changes Made

### 1. Fixed Network Error
- **Problem**: API was using `localhost:5173` which doesn't work on physical devices
- **Solution**: Changed default API URL to use your computer's IP address: `http://192.168.100.109:5173`
- **Note**: Created `.env` file with `EXPO_PUBLIC_API_URL` for easy configuration

### 2. Added Google Login
- Added "Continue with Google" button to both Login and Signup screens
- Uses `expo-web-browser` to open Google OAuth flow
- OAuth callback handled via `matcher://auth/callback` deep link (configured in `app.json`)

### 3. Added Password Confirmation
- Added "Confirm Password" field to Signup screen
- Validates that passwords match before submitting
- Shows error message if passwords don't match

### 4. Improved Error Handling
- Added error messages displayed on screen
- Added Alert dialogs for better user feedback
- Better validation for email/password fields

## How It Works

### Google OAuth Flow
1. User taps "Continue with Google"
2. Opens web browser with Google OAuth URL
3. User authenticates with Google
4. Google redirects back to `matcher://auth/callback`
5. App receives callback and navigates to main app

### API Configuration
The app now uses your computer's IP address (`192.168.100.109`) instead of `localhost`. This allows your phone to connect to the backend server.

**Important**: Make sure:
- Your backend server is running on port 5173
- Your phone and computer are on the same Wi-Fi network
- Firewall allows connections on port 5173

## Testing

1. **Test Email Signup**:
   - Enter name, email, password, and confirm password
   - Passwords must match
   - Should successfully create account

2. **Test Google Login**:
   - Tap "Continue with Google"
   - Should open browser with Google login
   - After authentication, should return to app

3. **Test Network Connection**:
   - Make sure backend is running: `cd ../web && npm run dev`
   - Verify API URL in `.env` matches your computer's IP
   - Check that phone and computer are on same network

## Troubleshooting

### "Network request failed"
- Check backend is running
- Verify IP address in `.env` is correct
- Ensure phone and computer are on same Wi-Fi
- Try using tunnel mode: `npm run start:tunnel`

### Google Login not working
- Check that Google OAuth is configured on backend
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_REDIRECT_URI` are set
- Make sure redirect URI includes your IP address or uses tunnel

### Passwords don't match
- Check that both password fields have the same value
- Error message will show if they don't match

## Next Steps

If you need to change the API URL:
1. Edit `.env` file: `EXPO_PUBLIC_API_URL=http://YOUR_IP:5173`
2. Restart Metro bundler
3. Reload the app

To find your IP address:
```bash
ip addr show | grep "inet " | grep -v "127.0.0.1"
```

