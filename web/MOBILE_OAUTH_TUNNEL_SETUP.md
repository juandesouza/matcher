# Mobile OAuth Setup with Tunnel (ngrok)

Google Cloud Console doesn't accept private IP addresses (192.168.x.x) in Authorized redirect URIs. We need to use a public URL via a tunnel service.

## Quick Setup: ngrok with Fixed URL (Recommended)

### Step 1: Sign up for free ngrok account
1. Go to: https://dashboard.ngrok.com/signup
2. Sign up (it's free)
3. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
4. Copy your authtoken

### Step 2: Configure ngrok with your authtoken
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```
(Replace `YOUR_AUTH_TOKEN` with the token you copied)

### Step 3: Get a free fixed domain
1. Go to: https://dashboard.ngrok.com/cloud-edge/domains
2. Click "Create Domain" or "Reserve Domain"
3. Choose a subdomain name (e.g., `matcher-dev`)
4. You'll get a domain like: `matcher-dev.ngrok-free.app`

### Step 4: Start ngrok with your fixed domain
```bash
ngrok http 5173 --domain=matcher-dev.ngrok-free.app
```
(Replace `matcher-dev.ngrok-free.app` with your actual domain)

### Step 5: Add to Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click **Edit**
4. In **Authorized redirect URIs**, add:
   ```
   https://matcher-dev.ngrok-free.app/api/auth/google/callback
   ```
   (Replace with your actual domain)
5. Click **Save**

### Step 6: Update mobile app
Update `mobile/.env`:
```
EXPO_PUBLIC_API_URL=https://matcher-dev.ngrok-free.app
```

### Step 7: Restart and test
1. Restart Metro bundler
2. Try logging in with Google

---

## Option 1: Using ngrok (Without Fixed Domain - URLs Change)

### Step 1: Install ngrok

```bash
# Install ngrok globally
npm install -g ngrok

# Or download from https://ngrok.com/download
```

### Step 2: Start your backend server

```bash
cd /home/juan/Projects/matcher/web
npm run dev
```

### Step 3: Start ngrok in another terminal

```bash
ngrok http 5173
```

This will give you a public URL like: `https://abc123.ngrok.io`

### Step 4: Add the ngrok URL to Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Click **Edit**
4. In **Authorized redirect URIs**, add:
   ```
   https://abc123.ngrok.io/api/auth/google/callback
   ```
   (Replace `abc123.ngrok.io` with your actual ngrok URL)
5. Click **Save**

### Step 5: Update mobile app configuration

Update the mobile app to use the ngrok URL:

1. In `mobile/src/utils/api.ts`, update `API_BASE_URL`:
   ```typescript
   const API_BASE_URL = 'https://abc123.ngrok.io';
   ```

2. Or set it via environment variable in `mobile/.env`:
   ```
   EXPO_PUBLIC_API_URL=https://abc123.ngrok.io
   ```

### Step 6: Restart everything

1. Restart your backend server
2. Restart Metro bundler
3. Try logging in with Google

## Option 2: Using localtunnel (Alternative)

```bash
# Install localtunnel
npm install -g localtunnel

# Start tunnel
lt --port 5173
```

This will give you a URL like: `https://random-name.loca.lt`

Add this URL to Google Cloud Console the same way as ngrok.

## Important Notes

⚠️ **ngrok URLs change each time** (unless you have a paid plan):
- Free ngrok URLs change every time you restart ngrok
- You'll need to update Google Cloud Console and the mobile app each time
- Consider getting a free ngrok account to get a fixed subdomain

⚠️ **Security**:
- ngrok URLs are public - anyone with the URL can access your dev server
- Only use this for development, not production

## Getting a Fixed ngrok URL (Optional)

1. Sign up for a free ngrok account: https://dashboard.ngrok.com/signup
2. Get your authtoken from the dashboard
3. Configure ngrok:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
4. Start ngrok with a fixed domain:
   ```bash
   ngrok http 5173 --domain=your-fixed-domain.ngrok-free.app
   ```

This way, your URL stays the same and you only need to configure it once.

