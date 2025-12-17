# Mobile Layout Guide

This document describes the mobile-specific layout patterns, spacing, and component specifications for the React Native implementation.

## Breakpoints

- **Mobile**: < 768px (default, single column)
- **Desktop**: ≥ 768px (split screen with sidebar)

**Note**: React Native app should focus on mobile-first design (< 768px equivalent).

## Screen Structure

### Main Layout

```
┌─────────────────────────┐
│   Status Bar (system)   │
├─────────────────────────┤
│                         │
│   Back Button (top)     │  ← Fixed, top-left
│                         │
│   Main Content          │
│   (scrollable)          │
│                         │
│                         │
│                         │
├─────────────────────────┤
│   Bottom Navigation     │  ← Fixed, height: 76px (4.75rem)
│   [Home] [Chat] [⚙️]    │
└─────────────────────────┘
```

### Key Measurements

- **Bottom Navbar Height**: 76px (4.75rem)
- **Top Padding**: 32px (2rem) on mobile
- **Side Padding**: 16px (1rem) on mobile
- **Card Container Height**: 600px on mobile
- **Button Size (Circle)**: 56px × 56px on mobile, 64px × 64px on desktop
- **Button Gap**: 1rem (16px) between like/dislike buttons on mobile

## Component Specifications

### 1. Swipe Card

**Dimensions:**
- **Mobile**: Full width minus padding (max-width: ~28rem)
- **Height**: 600px (includes photo + bio)
- **Border Radius**: 16px
- **Photo Area**: 450px height
- **Bio Area**: Remaining space (flexible)

**Layout:**
```
┌─────────────────────┐
│                     │
│   Photo Area        │  ← 450px height
│   (carousel)        │
│                     │
├─────────────────────┤
│   Name & Age        │  ← Padding: 1rem
│   Bio Text          │
│                     │
└─────────────────────┘
```

**Swipe Behavior:**
- **Threshold**: 100px horizontal movement
- **Rotation Factor**: 0.1 (10% of horizontal movement)
- **Opacity**: Fades from 1.0 to 0.3 based on distance
- **Animation**: 300ms ease-out transition

**Photo Carousel:**
- Swipe left/right on photo area to change photos
- Dot indicators at bottom of photo
- Smooth transitions between photos

### 2. Action Buttons (Like/Dislike)

**Mobile Layout:**
- Positioned **below** the card (not overlapping)
- Horizontal layout with gap: 1rem (16px)
- Centered alignment
- Margin-top: 0.5rem from card

**Button Specs:**
- **Size**: 56px × 56px (circle)
- **Like Button**: White background, gray icon (dislike-gray)
- **Dislike Button**: White background, gray icon (dislike-gray)
- **Active State**: Scale to 0.95 on press
- **Shadow**: Subtle shadow for depth

**Layout:**
```
┌─────────────────────┐
│      Card           │
└─────────────────────┘
      ↓ 0.5rem gap
  [X]    [❤️]         ← 1rem gap between buttons
```

### 3. Bottom Navigation

**Specifications:**
- **Height**: 76px (4.75rem)
- **Position**: Fixed at bottom
- **Background**: Theme-aware (light grey in light mode, dark in dark mode)
- **Border**: Top border (1px, theme-aware color)
- **Z-index**: 50 (above content)

**Items:**
- **Home** (Discover): Left
- **Chat** (Matches): Center (mobile only)
- **Settings**: Right

**Item Layout:**
- Icon: 24px × 24px
- Label: 12px font size
- Gap between icon and label: 4px (0.25rem)
- Padding: 12px horizontal, 8px vertical
- Active state: Crimson pulse color
- Inactive state: 70% opacity text color

### 4. Matches List (Chat Page)

**Card Layout:**
- Full width cards
- Padding: 16px (1rem)
- Border radius: 16px
- **Entire card is clickable** (not just the red circle button)

**Card Structure:**
```
┌─────────────────────────────────────┐
│ [Avatar]  Name, Age      [Red ⭕]  │  ← All clickable
└─────────────────────────────────────┘
```

**Specifications:**
- Avatar: 64px × 64px (rounded)
- Name: 18px font, semibold
- Age: 14px font, 60% opacity
- Red circle button: 56px × 56px
- Gap between elements: 16px (1rem)
- Divider between cards: 1px border (theme-aware)

**Hover/Press State:**
- Light overlay on press (10% opacity dark card color)
- Active match: Left border 4px crimson pulse

### 5. Chat Interface

**Layout:**
```
┌─────────────────────────┐
│ [Avatar] Name, Age     │  ← Header (fixed)
├─────────────────────────┤
│                         │
│   Messages (scrollable) │
│                         │
│                         │
├─────────────────────────┤
│ [Ad Banner] (if not sub)│  ← Optional
├─────────────────────────┤
│ [📷] [Input] [Send]     │  ← Input area (fixed)
└─────────────────────────┘
```

**Header:**
- Height: Auto (padding: 16px)
- Background: Theme-aware card color
- Border: Bottom border (theme-aware)

**Message Bubbles:**
- **Own messages**: Crimson pulse background, white text
- **Other messages**: Light grey (light theme) or dark card (dark theme)
- Border radius: 16px (rounded-2xl)
- Max width: 75% of screen
- Padding: 16px horizontal, 8px vertical
- Timestamp: 12px font, 70% opacity

**Input Area:**
- Height: Auto (padding: 16px)
- Background: Theme-aware card color
- Border: Top border (theme-aware)
- Input field: Rounded full, theme-aware background
- Send button: Circle, 56px × 56px

### 6. Settings Page

**Layout:**
- Full width cards
- Card padding: 16px (1rem)
- Gap between cards: 16px (1rem)
- Section padding: 32px (2rem) top/bottom

**Input Fields:**
- Background: Theme-aware (light grey in light mode, dark in dark mode)
- Border: 1px, theme-aware color
- Border radius: 12px
- Padding: 12px horizontal, 8px vertical
- Text color: Theme-aware
- Focus ring: 2px crimson pulse

**Theme Toggle Button:**
- Circle button: 56px × 56px
- Background: Light grey (light theme) or dark card (dark theme)
- Icon: Sun (dark mode) / Moon (light mode)
- Icon size: 24px

### 7. Back Button

**Specifications:**
- Position: Fixed, top-left
- Offset: 16px from top and left
- Size: Auto (padding: 8px)
- Background: Theme-aware card color
- Border: 1px, theme-aware
- Border radius: Full (circle)
- Icon: ArrowLeft, 24px
- Shadow: Subtle shadow
- Z-index: 50

## Spacing System

Based on 8px grid:

- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem) ← **Most common**
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

**Common Patterns:**
- Card padding: 16px (md)
- Section spacing: 32px (xl)
- Button gap: 16px (md)
- Input padding: 12px horizontal, 8px vertical

## Typography Scale

**Font Family**: Inter (or system equivalent: SF Pro on iOS, Roboto on Android)

**Sizes:**
- **xs**: 12px (0.75rem) - Labels, timestamps
- **sm**: 14px (0.875rem) - Secondary text
- **base**: 16px (1rem) - Body text, buttons
- **lg**: 18px (1.125rem) - Card names
- **xl**: 20px (1.25rem) - Section headers
- **2xl**: 24px (1.5rem) - Page titles
- **3xl**: 30px (1.875rem) - Large titles

**Weights:**
- **Regular**: 400 - Body text
- **Medium**: 500 - Buttons, labels
- **Semibold**: 600 - Headers, card names
- **Bold**: 700 - Emphasis

**Line Heights:**
- **Tight**: 1.2 - Headers
- **Normal**: 1.5 - Body text
- **Relaxed**: 1.75 - Long text

## Theme System

### Dark Theme (Default)
- Background: `#121212`
- Card: `#1E1E1E`
- Text: `#F8F8F8`
- Borders: `#374151` (gray-700)

### Light Theme
- Background: `#f3f4f6` (soft grey, not white)
- Card: `#FFFFFF`
- Text: `#222222`
- Borders: `#D1D5DB` (gray-300)

**Theme Toggle:**
- Stored in user preferences
- Persisted to backend
- Applied globally on app start

## Animations

### Swipe Card
- **Duration**: 300ms
- **Easing**: ease-out
- **Transform**: translateX + rotate
- **Opacity**: Fades during swipe

### Button Press
- **Duration**: 180ms
- **Transform**: scale(0.95)
- **Easing**: ease

### Page Transitions
- **Duration**: 250ms
- **Easing**: ease-in-out

### Theme Switch
- **Duration**: 200ms
- **Properties**: background-color, color, border-color

## Touch Targets

**Minimum Size**: 44px × 44px (iOS) / 48px × 48px (Android)

**Actual Sizes:**
- Buttons: 56px × 56px (mobile), 64px × 64px (desktop)
- Nav items: ~60px × 76px (full navbar height)
- Cards: Full width, 600px height
- Input fields: Minimum 44px height

## Safe Areas

**iOS:**
- Top: Status bar + notch (if present)
- Bottom: Home indicator area

**Android:**
- Top: Status bar
- Bottom: Navigation bar (if present)

**Implementation:**
- Use `SafeAreaView` or equivalent
- Add padding for status bar on Android
- Account for home indicator on iOS

## Scroll Behavior

- **Pull to refresh**: Available on main feed
- **Infinite scroll**: Not implemented (loads all cards)
- **Scroll indicators**: Native platform style
- **Momentum scrolling**: Enabled
- **Bounce**: iOS only (native behavior)

## Gestures

### Swipe Card
- **Direction**: Horizontal (left = dislike, right = like)
- **Threshold**: 100px
- **Rotation**: 0.1 factor (10% of horizontal movement)
- **Multi-touch**: Disabled during swipe

### Photo Carousel
- **Direction**: Horizontal
- **Threshold**: 50px
- **Animation**: Smooth transition

### Pull to Refresh
- **Trigger**: Pull down 80px
- **Animation**: Native spinner

## React Native Implementation Notes

1. **Use Platform.select()** for platform-specific styles
2. **Use Dimensions API** for responsive sizing
3. **Use Animated API** for swipe animations
4. **Use PanResponder** for gesture handling
5. **Use SafeAreaView** for safe area handling
6. **Use StatusBar** component for status bar styling
7. **Use react-native-gesture-handler** for better gesture support
8. **Use react-native-reanimated** for smooth animations

## Component Hierarchy

```
App
├── NavigationContainer
│   ├── Stack Navigator
│   │   ├── Home Screen
│   │   │   ├── SwipeCard
│   │   │   └── ActionButtons
│   │   ├── Matches Screen
│   │   │   └── MatchCard[]
│   │   ├── Chat Screen
│   │   │   ├── ChatHeader
│   │   │   ├── MessageList
│   │   │   └── ChatInput
│   │   └── Settings Screen
│   └── Tab Navigator (Bottom)
│       ├── Home Tab
│       ├── Chat Tab
│       └── Settings Tab
```

