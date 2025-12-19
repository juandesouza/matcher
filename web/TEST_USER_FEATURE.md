# Test User Feature

## Overview
The test user feature allows users to explore the app without signing up. Test users are automatically deleted after 24 hours.

## Features
- **Easy Testing**: Users can click "Enter as Test User" on the login screen
- **Complete Profile**: Test users have a complete profile (age, gender, bio, photos)
- **2 Pre-made Matches**: Each test user gets 2 fake matches with sample messages
- **Full App Access**: Test users can swipe, chat, and use all app features
- **Auto Cleanup**: Test users are deleted after 24 hours

## Implementation

### API Endpoint
- **POST `/api/auth/test-user`**: Creates a test user with 2 matches and sample messages

### Cleanup Endpoint
- **POST `/api/admin/cleanup-test-users`**: Deletes test users older than 24 hours
  - Requires `CLEANUP_SECRET` in request body: `{ secret: "your-secret" }`
  - Set `CLEANUP_SECRET` environment variable on Render

### Setting Up Cleanup Cron Job

#### Option 1: Render Cron Job (Recommended)
1. Go to Render Dashboard
2. Create a new **Cron Job** service
3. Set:
   - **Schedule**: `0 */6 * * *` (every 6 hours) or `0 0 * * *` (daily at midnight)
   - **Command**: 
     ```bash
     curl -X POST https://matcher-m0o4.onrender.com/api/admin/cleanup-test-users \
       -H "Content-Type: application/json" \
       -d '{"secret":"YOUR_CLEANUP_SECRET"}'
     ```
   - **Environment Variable**: `CLEANUP_SECRET=your-secret-here`

#### Option 2: External Cron Service
Use a service like:
- **cron-job.org**: Free cron service
- **EasyCron**: Free tier available
- **GitHub Actions**: If using GitHub

Set up a webhook to call:
```
POST https://matcher-m0o4.onrender.com/api/admin/cleanup-test-users
Content-Type: application/json

{
  "secret": "YOUR_CLEANUP_SECRET"
}
```

#### Option 3: Manual Cleanup
You can manually trigger cleanup by calling the endpoint:
```bash
curl -X POST https://matcher-m0o4.onrender.com/api/admin/cleanup-test-users \
  -H "Content-Type: application/json" \
  -d '{"secret":"YOUR_CLEANUP_SECRET"}'
```

## Test User Data
- **Email**: `test_user_<timestamp>@test.matcher.app`
- **Name**: "Test User"
- **Age**: 25
- **Gender**: male
- **Location**: Ilhéus, Brazil
- **Matches**: 2 fake female users with sample messages

## Identification
Test users are identified by:
- Email starts with `test_`
- Created more than 24 hours ago

The cleanup job deletes:
- Test user account
- Associated matches
- Chats and messages
- Swipes
- Auth keys and sessions

