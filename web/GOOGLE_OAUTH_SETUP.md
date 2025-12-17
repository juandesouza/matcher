# Google OAuth Setup Guide

## Error: redirect_uri_mismatch

This error occurs when the redirect URI used in your OAuth request doesn't match what's registered in Google Cloud Console.

## Current Configuration

- **Client ID**: `589643931802-s8jcap8stittpgnbo64vo2h5qo6ft4tu.apps.googleusercontent.com`
- **Redirect URI (Local)**: `http://localhost:5173/api/auth/google/callback`

## How to Fix

### Step 1: Go to Google Cloud Console
1. Visit: https://console.cloud.google.com/
2. Select your project (or create a new one)

### Step 2: Navigate to OAuth Credentials
1. Go to **APIs & Services** > **Credentials**
2. Find your OAuth 2.0 Client ID: `589643931802-s8jcap8stittpgnbo64vo2h5qo6ft4tu.apps.googleusercontent.com`
3. Click **Edit** (pencil icon)

### Step 3: Add Authorized Redirect URIs
In the **Authorized redirect URIs** section, add:

**For Local Development (Web):**
```
http://localhost:5173/api/auth/google/callback
```

**For Mobile Development (Private IP):**
```
http://192.168.100.109:5173/api/auth/google/callback
```
⚠️ **Note**: Replace `192.168.100.109` with your actual local IP address. You can find it with:
```bash
ip addr show | grep "inet " | grep -v "127.0.0.1"
```

**For Production (when deploying):**
```
https://your-domain.com/api/auth/google/callback
```

### Step 4: Save
Click **Save** at the bottom of the page.

## Important Notes

1. **Exact Match Required**: The redirect URI must match **exactly** (including protocol, port, and path)
2. **No Trailing Slash**: Don't add a trailing slash unless your code uses one
3. **Multiple URIs**: You can add multiple redirect URIs (one per line) for different environments
4. **Changes Take Effect Immediately**: No need to wait after saving

## Testing

After adding the redirect URI:
1. Restart your dev server
2. Try logging in with Google again
3. You should be redirected to Google's consent screen

## Common Redirect URIs

### Development
- `http://localhost:5173/api/auth/google/callback`
- `http://127.0.0.1:5173/api/auth/google/callback`

### Production
- `https://yourdomain.com/api/auth/google/callback`
- `https://www.yourdomain.com/api/auth/google/callback`

## Troubleshooting

If you still get the error after adding the URI:
1. **Double-check the exact URI** - Copy it from your `.env` file or server logs
2. **Check for typos** - Common mistakes: `http` vs `https`, wrong port, trailing slash
3. **Wait a few seconds** - Sometimes there's a brief delay
4. **Clear browser cache** - Old redirects might be cached
5. **Check server logs** - The debug logs will show the exact redirect URI being used

## Reference

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Authorization Errors](https://developers.google.com/identity/protocols/oauth2/web-server#authorization-errors)

