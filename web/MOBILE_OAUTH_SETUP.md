# Mobile OAuth Setup Guide

## Error: "This app's request is invalid"

This error occurs when the redirect URI used in your OAuth request is not registered in Google Cloud Console.

## Current Mobile Configuration

- **Client ID**: `589643931802-s8jcap8stittpgnbo64vo2h5qo6ft4tu.apps.googleusercontent.com`
- **Redirect URI (Mobile)**: `http://192.168.100.109:5173/api/auth/google/callback`

⚠️ **Important**: Replace `192.168.100.109` with your actual local IP address if different.

## How to Fix

### Step 1: Find Your Local IP Address

Run this command to find your IP:
```bash
ip addr show | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | cut -d/ -f1
```

Or on macOS:
```bash
ifconfig | grep "inet " | grep -v "127.0.0.1"
```

### Step 2: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project
3. Go to **APIs & Services** > **Credentials**
4. Find your OAuth 2.0 Client ID: `589643931802-s8jcap8stittpgnbo64vo2h5qo6ft4tu.apps.googleusercontent.com`
5. Click **Edit** (pencil icon)

### Step 3: Add Mobile Redirect URI

In the **Authorized redirect URIs** section, add:

```
http://192.168.100.109:5173/api/auth/google/callback
```

⚠️ **Replace `192.168.100.109` with your actual IP address!**

### Step 4: Save

Click **Save** at the bottom of the page.

## Important Notes

1. **Exact Match Required**: The redirect URI must match **exactly** (including protocol, port, and path)
2. **Private IPs**: Google allows private IPs (192.168.x.x, 10.x.x.x) for OAuth, but they must be registered
3. **Device Parameters**: The mobile app automatically includes `device_id` and `device_name` parameters required for private IP OAuth
4. **Changes Take Effect Immediately**: No need to wait after saving

## Testing

After adding the redirect URI:
1. Restart your dev server (`npm run dev` in `web/`)
2. Try logging in with Google from the mobile app
3. You should be redirected to Google's consent screen

## Troubleshooting

### Still getting "invalid request" error?

1. **Check the exact redirect URI** - Look at the server logs when you try to log in. It will show the redirect URI being used.
2. **Verify in Google Cloud Console** - Make sure the URI in the console matches exactly (no trailing slashes, correct IP, correct port)
3. **Check your IP address** - Your IP might have changed. Run the command above to get your current IP.

### IP Address Changed?

If your IP address changes (e.g., you connect to a different network), you'll need to:
1. Update the redirect URI in Google Cloud Console
2. Update `EXPO_PUBLIC_API_URL` in `mobile/.env` (if you have one)
3. Restart both the backend server and Metro bundler

## Alternative: Use a Tunnel Service

If you frequently change networks, consider using a tunnel service like ngrok:

1. Install ngrok: `npm install -g ngrok`
2. Start your backend: `npm run dev` in `web/`
3. In another terminal: `ngrok http 5173`
4. Use the ngrok URL (e.g., `https://abc123.ngrok.io`) as your redirect URI
5. Add `https://abc123.ngrok.io/api/auth/google/callback` to Google Cloud Console

This way, your redirect URI stays the same even if your IP changes.

