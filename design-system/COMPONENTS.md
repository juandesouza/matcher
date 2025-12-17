# Component Specifications

Detailed specifications for all UI components in the Matcher app.

## 1. SwipeCard

### Purpose
Displays user profile cards that can be swiped left (dislike) or right (like).

### Props
```typescript
interface SwipeCardProps {
  user: {
    id: string;
    name: string;
    age: number;
    photos: string[];
    bio: string;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onLike: () => void;
  onDislike: () => void;
}
```

### Visual Structure
```
┌─────────────────────────┐
│                         │
│   Photo Carousel        │  ← 450px height
│   [dots indicator]      │
│                         │
├─────────────────────────┤
│   Name, Age             │  ← 18px font, semibold
│   Bio text...           │  ← 16px font, normal
│                         │
└─────────────────────────┘
```

### Specifications
- **Width**: Full width minus 32px padding (mobile)
- **Height**: 600px (mobile)
- **Border Radius**: 16px
- **Background**: Theme-aware card color
- **Photo Area**: 450px height, full width
- **Bio Area**: Flexible height, padding 16px
- **Shadow**: Subtle (light theme only)

### Interactions
- **Swipe Left**: Triggers `onSwipeLeft` (dislike)
- **Swipe Right**: Triggers `onSwipeRight` (like)
- **Photo Swipe**: Horizontal swipe to change photos
- **Tap Photo**: No action (or could open fullscreen)

### Animations
- **Swipe**: 300ms ease-out
- **Rotation**: 0.1 factor (10% of horizontal movement)
- **Opacity**: Fades from 1.0 to 0.3 based on distance
- **Photo Transition**: 300ms ease-out

### React Native Implementation
```typescript
import { Animated, PanResponder } from 'react-native';

// Use PanResponder for swipe gestures
// Use Animated API for smooth animations
// Use Image component for photos with carousel
```

## 2. ActionButtons

### Purpose
Like and dislike buttons displayed below the swipe card.

### Layout
```
  [X]    [❤️]
```

### Specifications
- **Container**: Horizontal flex, gap 16px, centered
- **Button Size**: 56px × 56px (mobile)
- **Shape**: Circle (border-radius: 50%)
- **Background**: White (both themes)
- **Icon Color**: Dislike gray (#9E9E9E)
- **Shadow**: Subtle shadow
- **Position**: Below card, 8px margin-top

### Interactions
- **Press**: Triggers like/dislike action
- **Active State**: Scale to 0.95
- **Haptic Feedback**: Light haptic on press

### React Native Implementation
```typescript
import { TouchableOpacity, Animated } from 'react-native';
import { Heart, X } from 'lucide-react-native';

// Use TouchableOpacity for press handling
// Use Animated for scale animation
// Use react-native-haptic-feedback for haptics
```

## 3. BottomNavigation

### Purpose
Fixed bottom navigation bar with main app sections.

### Items
- **Home** (Discover): Swipe cards
- **Chat** (Matches): Matches list (mobile only)
- **Settings**: App settings

### Specifications
- **Height**: 76px (4.75rem)
- **Position**: Fixed at bottom
- **Background**: Theme-aware card color
- **Border**: Top border, 1px, theme-aware
- **Z-index**: 50

### Item Specifications
- **Icon Size**: 24px × 24px
- **Label Size**: 12px
- **Padding**: 12px horizontal, 8px vertical
- **Gap**: 4px between icon and label
- **Active Color**: Crimson pulse (#C62828)
- **Inactive Color**: 70% opacity text color

### Layout
```
┌─────────────────────────────────┐
│  [🏠]      [💬]      [⚙️]      │
│  Home      Chat     Settings     │
└─────────────────────────────────┘
```

### React Native Implementation
```typescript
import { View, TouchableOpacity, Text } from 'react-native';
import { Home, MessageCircle, Settings } from 'lucide-react-native';

// Use SafeAreaView for bottom safe area
// Use react-navigation bottom tabs or custom implementation
```

## 4. MatchCard

### Purpose
Displays a match in the matches list. Entire card is clickable.

### Layout
```
┌─────────────────────────────────────┐
│ [Avatar]  Name, Age      [Red ⭕]  │
└─────────────────────────────────────┘
```

### Specifications
- **Width**: Full width minus 32px padding
- **Height**: Auto (padding 16px)
- **Border Radius**: 16px
- **Background**: Theme-aware card color
- **Border**: Bottom border, 1px, theme-aware (between cards)
- **Padding**: 16px all sides
- **Gap**: 16px between elements

### Elements
- **Avatar**: 64px × 64px, rounded
- **Name**: 18px font, semibold, theme-aware text
- **Age**: 14px font, 60% opacity
- **Button**: 56px × 56px circle, crimson pulse background

### States
- **Default**: Normal background
- **Pressed**: 10% opacity overlay (dark card color)
- **Active**: Left border 4px crimson pulse

### Interactions
- **Press Anywhere**: Opens chat
- **Press Button**: Also opens chat (no double trigger)

### React Native Implementation
```typescript
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { MessageCircle } from 'lucide-react-native';

// Entire card is TouchableOpacity
// Button inside uses stopPropagation equivalent
```

## 5. ChatMessage

### Purpose
Individual message bubble in chat interface.

### Layout (Own Message)
```
                    ┌─────────────┐
                    │   Message   │
                    │  Timestamp  │
                    └─────────────┘
```

### Layout (Other Message)
```
┌─────────────┐
│   Message   │
│  Timestamp  │
└─────────────┘
```

### Specifications
- **Max Width**: 75% of screen width
- **Border Radius**: 16px (rounded-2xl)
- **Padding**: 16px horizontal, 8px vertical
- **Own Message**: Crimson pulse background, white text
- **Other Message**: Light grey (light) or dark card (dark), theme-aware text
- **Timestamp**: 12px font, 70% opacity, bottom of bubble

### Message Types
- **Text**: Plain text message
- **Image**: Clickable image (opens fullscreen)
- **Video**: Video player with controls
- **Audio**: Audio player with controls

### React Native Implementation
```typescript
import { View, Text, Image, TouchableOpacity } from 'react-native';

// Use conditional styling based on isOwn prop
// Use Image component for images
// Use react-native-video for video
// Use react-native-sound for audio
```

## 6. ChatInput

### Purpose
Input area for sending messages in chat.

### Layout
```
┌─────────────────────────────────┐
│ [📷] [Input Field]      [Send]  │
└─────────────────────────────────┘
```

### Specifications
- **Height**: Auto (padding 16px)
- **Background**: Theme-aware card color
- **Border**: Top border, 1px, theme-aware
- **Input Field**: 
  - Border radius: Full (rounded-full)
  - Background: Theme-aware (gray-800 dark, gray-200 light)
  - Padding: 8px horizontal, 8px vertical
  - Text color: Theme-aware
- **Image Button**: 56px × 56px circle, transparent background
- **Send Button**: 56px × 56px circle, crimson pulse background

### Interactions
- **Input Focus**: Shows keyboard
- **Send**: Sends message, clears input
- **Image Button**: Opens image picker

### React Native Implementation
```typescript
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Image as ImageIcon, Send } from 'lucide-react-native';
import { KeyboardAvoidingView } from 'react-native';

// Use KeyboardAvoidingView for keyboard handling
// Use react-native-image-picker for image selection
```

## 7. SettingsCard

### Purpose
Card container for settings sections.

### Specifications
- **Width**: Full width minus 32px padding
- **Border Radius**: 16px
- **Background**: Theme-aware card color
- **Padding**: 16px all sides
- **Margin**: 16px bottom (between cards)
- **Shadow**: Subtle (light theme only)

### Content Structure
```
┌─────────────────────────┐
│   Title                 │
│   Description           │
│   [Control/Button]      │
└─────────────────────────┘
```

## 8. InputField

### Purpose
Text input for forms (settings, profile edit).

### Specifications
- **Height**: Auto (padding 12px horizontal, 8px vertical)
- **Border Radius**: 12px
- **Background**: Theme-aware (gray-200 light, gray-800 dark)
- **Border**: 1px, theme-aware (gray-300 light, gray-700 dark)
- **Text Color**: Theme-aware
- **Placeholder**: 60% opacity text color
- **Focus Ring**: 2px crimson pulse

### React Native Implementation
```typescript
import { TextInput, View } from 'react-native';

// Use TextInput with theme-aware styling
// Use onFocus/onBlur for focus ring
```

## 9. ThemeToggle

### Purpose
Button to toggle between light and dark themes.

### Specifications
- **Size**: 56px × 56px circle
- **Background**: Light grey (light theme) or dark card (dark theme)
- **Icon**: Sun (dark mode) or Moon (light mode)
- **Icon Size**: 24px
- **Icon Color**: Dark (light theme) or light (dark theme)
- **Hover/Press**: Slightly darker background

### React Native Implementation
```typescript
import { TouchableOpacity } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';

// Use theme context for state management
// Use Animated for smooth transitions
```

## 10. BackButton

### Purpose
Navigation button to go back to previous screen.

### Specifications
- **Position**: Fixed, top-left
- **Offset**: 16px from top and left
- **Size**: Auto (padding 8px)
- **Shape**: Circle
- **Background**: Theme-aware card color
- **Border**: 1px, theme-aware
- **Icon**: ArrowLeft, 24px
- **Icon Color**: Theme-aware text color
- **Shadow**: Subtle shadow
- **Z-index**: 50

### React Native Implementation
```typescript
import { TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

// Use navigation.goBack() for back action
// Use SafeAreaView for top offset
```

## 11. AdCard

### Purpose
Displays advertisement using same card format as user cards.

### Specifications
- **Same as SwipeCard** but with:
  - Ad content instead of user photo
  - "Sponsored" text instead of name
  - Ad description instead of bio
- **Interactions**:
  - Swipe left: Dismiss ad
  - Swipe right / Like: Open ad URL or subscribe page
  - Dislike: Dismiss ad

### React Native Implementation
```typescript
// Reuse SwipeCard component with ad-specific props
// Use WebView or Linking API for ad URLs
```

## Common Patterns

### Card Pattern
- Border radius: 16px
- Padding: 16px
- Background: Theme-aware
- Shadow: Subtle (light theme only)

### Button Pattern
- Circle buttons: 56px × 56px
- Rounded buttons: 12px border radius
- Active state: Scale 0.95
- Haptic feedback on press

### Input Pattern
- Border radius: 12px
- Padding: 12px horizontal, 8px vertical
- Background: Theme-aware
- Focus ring: 2px crimson pulse

### Text Pattern
- Headers: Semibold (600)
- Body: Regular (400)
- Labels: Medium (500)
- Opacity variants: 60%, 70%, 80% for secondary text

