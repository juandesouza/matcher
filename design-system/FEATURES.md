# App Features Documentation

This document describes all features of the Matcher web app that need to be implemented in the React Native mobile version to ensure a consistent user experience.

## Table of Contents

1. [Geolocation](#geolocation)
2. [Push Notifications](#push-notifications)
3. [AdSense Integration](#adsense-integration)
4. [Subscription System](#subscription-system)
5. [Swipe Cards](#swipe-cards)
6. [Matching System](#matching-system)
7. [Chat & Messaging](#chat--messaging)
8. [User Profile](#user-profile)
9. [Settings](#settings)
10. [Authentication](#authentication)

---

## Geolocation

### Overview
The app uses geolocation to find and display potential matches within the user's specified distance range.

### Implementation Details

#### When Location is Requested
1. **During Setup**: When a new user completes their profile setup
2. **On App Launch**: Every time the user opens the home page (swipe cards page)
3. **Periodic Updates**: Location should be updated periodically while the app is active

#### Location Update Flow
```javascript
// Web implementation reference
navigator.geolocation.getCurrentPosition(
  async (position) => {
    const location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    
    // Update user location in database
    await fetch('/api/location', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location)
    });
  },
  (error) => {
    console.error('Geolocation error:', error);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000 // Cache for 1 minute
  }
);
```

#### React Native Implementation
- **iOS**: Request `NSLocationWhenInUseUsageDescription` permission
- **Android**: Request `ACCESS_FINE_LOCATION` permission
- Use `@react-native-community/geolocation` or `expo-location`
- Update location via API endpoint: `PUT /api/location`
- Request body: `{ lat: number, lng: number }`

#### Distance Calculation
- Uses Haversine formula to calculate distance between two coordinates
- Distance range is user-configurable in settings (default: 50km)
- Only users within the distance range are shown as potential matches

#### Error Handling
- Handle permission denial gracefully
- Show user-friendly error messages
- Allow manual location entry as fallback (optional)

---

## Push Notifications

### Overview
Push notifications alert users about new matches and new messages, even when the app is not active.

### Notification Types

#### 1. New Match Notification
- **Trigger**: When two users like each other (mutual swipe right)
- **Content**: "You have a new match with [Name]!"
- **Action**: Tapping notification opens the match detail or chat screen
- **Timing**: Sent immediately when match is created

#### 2. New Message Notification
- **Trigger**: When user receives a new message in a chat
- **Content**: "[Name]: [Message preview]" or "[Name] sent you a message"
- **Action**: Tapping notification opens the specific chat
- **Timing**: Sent immediately when message is received

### Implementation Details

#### Backend Requirements
- Store push notification tokens for each user device
- Endpoint to register/update device tokens: `POST /api/push/register`
- Endpoint to unregister device tokens: `POST /api/push/unregister`
- Send notifications when:
  - Match is created (in `/api/swipes` endpoint)
  - Message is sent (in `/api/chat/[id]/messages` endpoint)

#### React Native Implementation

**iOS Setup:**
- Configure APNs (Apple Push Notification service)
- Request notification permissions using `@react-native-firebase/messaging` or `expo-notifications`
- Register device token with backend

**Android Setup:**
- Configure FCM (Firebase Cloud Messaging)
- Request notification permissions
- Register device token with backend

**Notification Handling:**
```javascript
// Example with expo-notifications
import * as Notifications from 'expo-notifications';

// Request permissions
const { status } = await Notifications.requestPermissionsAsync();

// Get push token
const token = await Notifications.getExpoPushTokenAsync();

// Register with backend
await fetch('/api/push/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: token.data, platform: 'ios' })
});

// Handle notification taps
Notifications.addNotificationResponseReceivedListener(response => {
  const data = response.notification.request.content.data;
  if (data.type === 'match') {
    navigation.navigate('Match', { matchId: data.matchId });
  } else if (data.type === 'message') {
    navigation.navigate('Chat', { chatId: data.chatId });
  }
});
```

#### Notification Payload Structure
```json
{
  "title": "New Match!",
  "body": "You have a new match with Sarah",
  "data": {
    "type": "match",
    "matchId": "clx123...",
    "userId": "clx456..."
  }
}
```

---

## AdSense Integration

### Overview
Google AdSense ads are displayed to non-subscribed users in two locations:
1. **Interstitial ads** between swipe cards
2. **Banner ads** at the bottom of chat screens

### Ad Display Logic

#### Subscription Check
- Check user's `isSubscribed` status from `/api/settings`
- Only show ads if `isSubscribed === false`
- Ads are completely hidden for subscribed users

#### 1. Interstitial Ads Between Cards

**Display Pattern:**
- After every swipe (like or dislike), show an ad card
- Ad appears in the same format as a user card (using SwipeCard component)
- Pattern: Card → Ad → Card → Ad → Card...

**Ad Card Structure:**
- Uses the same SwipeCard component layout
- Photo area displays AdSense ad (format: "auto", responsive: true)
- Name area shows "Sponsored" text
- Bio area shows: "Upgrade to remove all ads and enjoy an uninterrupted Matcher experience."
- Swipeable like regular cards
- Like button (heart) → Opens subscribe page
- Dislike button (X) → Dismisses ad and shows next card

**Implementation:**
```javascript
// After each swipe
if (!isSubscribed) {
  showAd = true; // Show ad card
}

// Ad card uses same SwipeCard component
<SwipeCard
  user={{
    id: '__ad__',
    name: 'Sponsored',
    age: 0,
    photos: [],
    bio: 'Upgrade to remove all ads...'
  }}
  onSwipeLeft={() => (showAd = false)}
  onSwipeRight={() => goto('/subscribe')}
  onLike={() => goto('/subscribe')}
  onDislike={() => (showAd = false)}
/>
```

**AdSense Component:**
- Slot ID: `1234567890` (replace with actual AdSense slot)
- Format: `auto`
- Responsive: `true`
- Loads AdSense script from: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={PUBLISHER_ID}`

#### 2. Banner Ads in Chat

**Display Location:**
- Fixed banner at the bottom of chat screen
- Above the message input area
- Only visible for non-subscribed users

**Banner Structure:**
- AdSense ad component (format: "auto", responsive: true)
- "Subscribe for removing ads" link below the ad
- Link navigates to `/subscribe` page

**Implementation:**
```javascript
{#if !isSubscribed}
  <div class="border-t border-gray-300 dark:border-gray-700 bg-card px-4 py-3">
    <AdSense slot="1234567891" format="auto" responsive={true} />
    <button on:click={() => goto('/subscribe')}>
      Subscribe for removing ads
    </button>
  </div>
{/if}
```

**AdSense Component:**
- Slot ID: `1234567891` (replace with actual AdSense slot)
- Format: `auto`
- Responsive: `true`

### React Native Implementation

**For Interstitial Ads:**
- Use React Native AdMob or Google Mobile Ads SDK
- Display ads in the same card format as user cards
- Implement swipe gestures for ad dismissal
- Use `InterstitialAd` or `NativeAdView` components

**For Banner Ads:**
- Use `BannerAd` component from Google Mobile Ads SDK
- Place at bottom of chat screen
- Ad unit ID should match web AdSense slot

**Configuration:**
- Get AdSense publisher ID from `/api/adsense` endpoint
- Response: `{ publisherId: string, enabled: boolean }`
- Only load ads if `enabled === true`

**Note:** AdSense web ads won't work in React Native. You'll need to:
1. Set up Google AdMob (mobile equivalent)
2. Create ad units in AdMob console
3. Use React Native Google Mobile Ads library
4. Map web AdSense slots to mobile AdMob ad unit IDs

---

## Subscription System

### Overview
Users can subscribe to remove all ads and unlock premium features. Subscription is managed through Stripe.

### Subscription Features
- Remove all advertisements
- Unlimited swipes
- See who liked you (future feature)
- Priority customer support (future feature)

### Pricing
- **Price**: $9.99 USD per month
- **Billing**: Recurring monthly subscription
- **Cancellation**: Can cancel anytime

### Subscription Flow

#### 1. Initiate Subscription
- User clicks "Subscribe" button in Settings page
- Or clicks "Subscribe for removing ads" link on ad cards
- Frontend calls: `POST /api/subscribe/create-checkout`
- Backend creates Stripe Checkout session
- Returns `sessionId`

#### 2. Stripe Checkout
- Redirect user to Stripe Checkout page
- User enters payment information
- Stripe processes payment
- On success: Redirect to `/subscribe/success?session_id={CHECKOUT_SESSION_ID}`
- On cancel: Redirect back to `/subscribe`

#### 3. Webhook Processing
- Stripe sends webhook to: `POST /api/subscribe/webhook`
- Events handled:
  - `checkout.session.completed`: Set `isSubscribed = true`
  - `customer.subscription.deleted`: Set `isSubscribed = false`
- Updates user record in database

#### 4. Subscription Status
- Checked via: `GET /api/settings`
- Returns: `{ isSubscribed: boolean, ... }`
- Used throughout app to conditionally show/hide ads

### React Native Implementation

**Stripe Integration:**
- Use `@stripe/stripe-react-native` or `expo-payments`
- For iOS: Use Stripe's native SDK
- For Android: Use Stripe's native SDK

**Checkout Flow:**
```javascript
import { useStripe } from '@stripe/stripe-react-native';

const { initPaymentSheet, presentPaymentSheet } = useStripe();

// 1. Create checkout session
const response = await fetch('/api/subscribe/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const { sessionId, clientSecret } = await response.json();

// 2. Initialize payment sheet
await initPaymentSheet({
  paymentIntentClientSecret: clientSecret,
  merchantDisplayName: 'Matcher Premium'
});

// 3. Present payment sheet
const { error } = await presentPaymentSheet();
if (!error) {
  // Payment successful
  navigation.navigate('SubscribeSuccess');
}
```

**Subscription Status:**
- Check on app launch
- Update UI immediately when subscription changes
- Hide all ads if `isSubscribed === true`

**Webhook Handling:**
- Backend handles webhooks (no mobile changes needed)
- Mobile app polls or uses push notifications to update subscription status

---

## Swipe Cards

### Overview
The core interaction of the app - users swipe through potential matches.

### Card Display
- Cards are stacked (current card on top, next card visible behind)
- Maximum 2-3 cards visible at once
- Cards show: photos, name, age, bio
- Photo carousel if multiple photos

### Swipe Actions
- **Swipe Right / Like**: User likes the profile
- **Swipe Left / Dislike**: User dislikes the profile
- **Button Actions**: Heart (like) and X (dislike) buttons for desktop

### Card Loading
- Load cards on app launch
- Preload next cards when user is on last card
- Filter by:
  - Gender preference
  - Age range
  - Distance range
  - Exclude already swiped users

### API Endpoint
- `GET /api/users/cards`
- Returns array of user profiles
- Filters applied server-side

### React Native Implementation
- Use `react-native-deck-swiper` or similar library
- Implement swipe gestures
- Match web card design (see COMPONENTS.md)
- Handle photo carousel with swipe gestures
- Preload cards for smooth experience

---

## Matching System

### Overview
When two users both swipe right on each other, a match is created.

### Match Creation Flow
1. User A swipes right on User B
2. System checks if User B has swiped right on User A
3. If yes: Create match, create chat, send push notifications
4. If no: Just record the swipe

### API Endpoint
- `POST /api/swipes`
- Body: `{ targetUserId: string, action: 'like' | 'dislike' }`
- Response: `{ success: boolean, isMatch: boolean, matchId?: string, matchedUser?: object }`

### Match Display
- Matches appear in:
  - Matches sidebar (desktop)
  - Matches list page (mobile: `/matches`)
  - Chat list page (mobile: `/chat`)
- Clicking a match opens the chat

### React Native Implementation
- Listen for match events
- Update matches list immediately when match occurs
- Navigate to match detail or chat screen
- Show match animation/celebration (optional)

---

## Chat & Messaging

### Overview
Users can send text messages to their matches.

### Chat Features
- Real-time message display
- Message history
- Send text messages
- Image upload (future: currently supported in web)
- Timestamp display
- Read receipts (future)

### Message Display
- Own messages: Right-aligned, different color
- Received messages: Left-aligned, different color
- Scroll to bottom on new message
- Auto-scroll when sending message

### API Endpoints
- `GET /api/chat/[id]/messages`: Fetch message history
- `POST /api/chat/[id]/messages`: Send new message
- Body: `{ content: string, type?: string }`

### React Native Implementation
- Use WebSocket or polling for real-time updates
- Implement message input with send button
- Handle keyboard appearance
- Scroll to bottom on new messages
- Show typing indicators (future)
- Implement image picker for photo messages

### Chat List
- Shows all active chats
- Displays last message preview
- Shows unread count (future)
- Sorted by most recent activity

---

## User Profile

### Overview
Users have profiles with photos, name, age, bio, and preferences.

### Profile Setup
- Required fields: Age, Gender, Bio, At least 1 photo
- Optional: Additional photos
- Location is captured during setup

### Profile Editing
- Users can edit: Name, Age, Bio, Photos
- Changes auto-save (no save button needed)
- Debounced updates (500ms delay)

### API Endpoints
- `GET /api/profile`: Get current user profile
- `PUT /api/profile`: Update profile
- `POST /api/profile/photo`: Upload profile photo

### React Native Implementation
- Use image picker for photo selection
- Implement photo cropping/editing
- Auto-save with debounce
- Show loading states during upload

---

## Settings

### Overview
Users can configure app preferences and manage their account.

### Settings Options
1. **Theme**: Light/Dark mode toggle
2. **Age Range**: Min and max age for potential matches
3. **Distance Range**: Maximum distance in km
4. **Language**: App language selection
5. **Subscription**: Subscribe/unsubscribe
6. **Logout**: Sign out of account

### Auto-Save
- All settings auto-save on change
- Debounced updates (500ms delay)
- No "Save" button needed

### API Endpoint
- `GET /api/settings`: Get user settings
- `PUT /api/settings`: Update settings
- Body: `{ ageRangeMin?: number, ageRangeMax?: number, distanceRange?: number, locale?: string, theme?: string }`

### React Native Implementation
- Use native pickers for ranges
- Implement theme toggle
- Auto-save with debounce
- Persist settings locally for offline access

---

## Authentication

### Overview
Users authenticate via email/password or OAuth (Google).

### Authentication Methods
1. **Email/Password**: Traditional signup/login
2. **Google OAuth**: Sign in with Google account

### Auth Flow
- Sign up → Profile setup → Home
- Login → Home (if profile complete) or Setup (if incomplete)
- Protected routes require authentication

### Session Management
- Uses secure HTTP-only cookies (web)
- For React Native: Use secure token storage
- Token refresh mechanism

### React Native Implementation
- Use `@react-native-async-storage/async-storage` or `expo-secure-store`
- Store auth tokens securely
- Implement token refresh
- Handle OAuth redirects (deep linking)

---

## Additional Features

### Navigation
- Bottom navigation bar (mobile)
- Back button (top-left on detail pages)
- Matches sidebar (desktop)

### Auto-Save
- Profile edits auto-save
- Settings changes auto-save
- Debounce: 500ms

### Error Handling
- Network error messages
- Permission denial messages
- Validation error messages

### Loading States
- Show loading indicators during API calls
- Skeleton screens for content loading
- Disable buttons during actions

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### User Data
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/photo` - Upload photo
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `PUT /api/location` - Update location

### Matching
- `GET /api/users/cards` - Get potential matches
- `POST /api/swipes` - Record swipe
- `GET /api/matches` - Get matches list

### Chat
- `GET /api/chat/[id]/messages` - Get messages
- `POST /api/chat/[id]/messages` - Send message

### Subscription
- `POST /api/subscribe/create-checkout` - Create checkout session
- `POST /api/subscribe/webhook` - Stripe webhook (backend only)

### Ads
- `GET /api/adsense` - Get AdSense config

### Push Notifications
- `POST /api/push/register` - Register device token (to be implemented)
- `POST /api/push/unregister` - Unregister device token (to be implemented)

---

## React Native Implementation Checklist

- [ ] Set up geolocation permissions and updates
- [ ] Implement push notification registration and handling
- [ ] Integrate AdMob for mobile ads (replace AdSense)
- [ ] Implement Stripe payment flow
- [ ] Build swipe card component matching web design
- [ ] Implement matching system with real-time updates
- [ ] Build chat interface with message sending
- [ ] Create profile setup and editing screens
- [ ] Implement settings with auto-save
- [ ] Set up authentication with secure token storage
- [ ] Implement navigation (bottom nav, back button)
- [ ] Add loading states and error handling
- [ ] Test all features on iOS and Android

---

## Notes for React Native Developers

1. **AdSense vs AdMob**: Web uses AdSense, but React Native must use AdMob (Google Mobile Ads SDK). You'll need separate ad unit IDs.

2. **Push Notifications**: Requires backend implementation to send notifications. Backend needs to store device tokens and send notifications via FCM/APNs.

3. **Stripe**: Use native Stripe SDKs for better UX. The web uses Stripe Checkout (redirect), but mobile can use Payment Sheet (native modal).

4. **Real-time Updates**: Consider using WebSockets or Server-Sent Events for real-time chat and match updates.

5. **Offline Support**: Consider caching user data, matches, and messages for offline access.

6. **Deep Linking**: Implement deep linking for push notification taps and OAuth redirects.

7. **Theme System**: Use React Native's Appearance API or a theme library (e.g., `react-native-paper`) to match the web's light/dark theme system.
