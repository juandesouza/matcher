# Matcher Design System

Shared design tokens, components, and guidelines for the Matcher web application and React Native mobile app.

## 📁 Structure

```
design-system/
├── tokens/
│   ├── colors.js          # Color palette (brand + themes)
│   ├── typography.js      # Font definitions and text styles
│   ├── spacing.js         # Spacing, border radius, shadows
│   └── animations.js     # Animation timings and easing
├── components/            # Component specifications (future)
├── README.md             # This file
├── MOBILE_LAYOUT.md      # Mobile-specific layout guide
├── COMPONENTS.md         # Detailed component specifications
└── REACT_NATIVE_GUIDE.md # React Native implementation guide
```

## 🎨 Brand Colors

- **Crimson Pulse**: `#C62828` - Primary brand color (like button, accents)
- **Ruby Ember**: `#D32F2F` - Secondary accent (hover states)
- **Match Green**: `#1DB954` - Match indicator
- **Dislike Gray**: `#9E9E9E` - Dislike indicator

## 🌓 Theme System

### Dark Theme (Default)
- **Background**: `#121212` (near black)
- **Card**: `#1E1E1E` (slightly lighter)
- **Text**: `#F8F8F8` (near white)
- **Borders**: `#374151` (gray-700)

### Light Theme
- **Background**: `#f3f4f6` (soft grey - not pure white for eye comfort)
- **Card**: `#FFFFFF` (white)
- **Text**: `#222222` (dark grey)
- **Borders**: `#D1D5DB` (gray-300)

**Important**: Light theme uses soft grey backgrounds to reduce eye strain, not pure white.

## 📐 Spacing System

Based on 8px grid:

- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem) ← **Most common**
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## 🔤 Typography

**Font Family**: Inter (Google Fonts)
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

**Font Sizes**:
- xs: 12px
- sm: 14px
- base: 16px
- lg: 18px
- xl: 20px
- 2xl: 24px
- 3xl: 30px
- 4xl: 36px

## 🎬 Animations

- **Fast**: 180ms (button presses)
- **Normal**: 250ms (page transitions)
- **Slow**: 350ms (complex animations)
- **Swipe**: 300ms ease-out
- **Easing**: ease-out (cubic-bezier(0.0, 0, 0.2, 1))

## 📱 Mobile Layout

### Key Measurements
- **Bottom Navbar**: 76px height
- **Card Height**: 600px (mobile)
- **Button Size**: 56px × 56px (mobile), 64px × 64px (desktop)
- **Card Border Radius**: 16px
- **Input Border Radius**: 12px

### Breakpoints
- **Mobile**: < 768px (single column)
- **Desktop**: ≥ 768px (split screen with sidebar)

See [MOBILE_LAYOUT.md](./MOBILE_LAYOUT.md) for detailed mobile layout specifications.

## 🧩 Components

### Core Components
1. **SwipeCard** - User profile card with swipe gestures
2. **ActionButtons** - Like/dislike buttons
3. **BottomNavigation** - Fixed bottom nav bar
4. **MatchCard** - Match list item (fully clickable)
5. **ChatMessage** - Message bubble
6. **ChatInput** - Message input area
7. **SettingsCard** - Settings section container
8. **InputField** - Form input
9. **ThemeToggle** - Theme switcher button
10. **BackButton** - Navigation back button

See [COMPONENTS.md](./COMPONENTS.md) for detailed component specifications.

## 🚀 Usage

### Web (SvelteKit)

```javascript
import colors from '../design-system/tokens/colors.js';
import typography from '../design-system/tokens/typography.js';

// Use CSS variables in styles
const style = {
  backgroundColor: 'var(--color-bg)',
  color: 'var(--color-text)',
};
```

### React Native

```typescript
import { colors } from '../design-system/tokens/colors';
import { useTheme } from '../theme/ThemeContext';

const MyComponent = () => {
  const { colors: themeColors } = useTheme();
  
  return (
    <View style={{ backgroundColor: themeColors.background.reactNative }}>
      <Text style={{ color: themeColors.text.reactNative }}>Hello</Text>
    </View>
  );
};
```

See [REACT_NATIVE_GUIDE.md](./REACT_NATIVE_GUIDE.md) for complete React Native implementation guide.

## 📋 Design Principles

1. **Mobile-First**: Design for mobile, enhance for desktop
2. **Accessibility**: Minimum 44px touch targets, proper contrast ratios
3. **Performance**: Smooth 60fps animations, optimized images
4. **Consistency**: Use design tokens consistently across platforms
5. **User Experience**: Intuitive gestures, clear feedback, haptic responses

## 🔄 Theme Switching

- Theme preference is stored in user settings
- Persisted to backend and local storage
- Applied globally on app start
- Smooth 200ms transition between themes

## 📱 Platform Considerations

### iOS
- Use SF Pro as fallback font
- Respect safe areas (notch, home indicator)
- Use native haptic feedback
- Support pull-to-refresh

### Android
- Use Roboto as fallback font
- Respect status bar and navigation bar
- Use Material Design haptics
- Support swipe gestures

## 🧪 Testing

Components should be tested for:
- Theme switching (light/dark)
- Responsive layouts (mobile/desktop)
- Touch interactions
- Accessibility (screen readers)
- Performance (60fps animations)

## 📚 Additional Resources

- [Mobile Layout Guide](./MOBILE_LAYOUT.md) - Detailed mobile layout specifications
- [Component Specifications](./COMPONENTS.md) - Complete component specs
- [React Native Guide](./REACT_NATIVE_GUIDE.md) - RN implementation details

## 🤝 Contributing

When adding new components or tokens:
1. Update relevant token files
2. Document in COMPONENTS.md
3. Add React Native implementation examples
4. Test on both platforms
5. Update this README if needed
