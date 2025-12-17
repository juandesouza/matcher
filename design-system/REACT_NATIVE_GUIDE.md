# React Native Implementation Guide

This guide provides specific instructions for implementing the Matcher design system in React Native.

## Setup

### Required Dependencies

```json
{
  "dependencies": {
    "react-native": "^0.73.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0",
    "@react-navigation/bottom-tabs": "^6.5.0",
    "react-native-gesture-handler": "^2.14.0",
    "react-native-reanimated": "^3.6.0",
    "react-native-safe-area-context": "^4.8.0",
    "react-native-screens": "^3.29.0",
    "react-native-vector-icons": "^10.0.0",
    "lucide-react-native": "^0.300.0",
    "react-native-haptic-feedback": "^1.12.0",
    "react-native-image-picker": "^7.0.0",
    "react-native-video": "^5.2.0"
  }
}
```

### Theme Provider Setup

```typescript
// theme/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../design-system/tokens/colors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: typeof colors.light | typeof colors.dark;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const savedTheme = await AsyncStorage.getItem('matcher-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    await AsyncStorage.setItem('matcher-theme', newTheme);
    // Also save to backend
  };

  const themeColors = theme === 'light' ? colors.light : colors.dark;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

## Color Usage

### Import Colors

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

### Brand Colors

```typescript
// Use directly (same in both themes)
const likeButton = {
  backgroundColor: colors.crimsonPulse.reactNative, // #C62828
};

const dislikeButton = {
  backgroundColor: colors.dislikeGray.reactNative, // #9E9E9E
};
```

## Typography

### Font Setup

```typescript
// fonts.ts
export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

// Add Inter font files to assets/fonts/
// Update react-native.config.js or use react-native-asset
```

### Text Styles

```typescript
import { typography } from '../design-system/tokens/typography';

const textStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: typography.fontWeights.semibold,
    lineHeight: 24 * typography.lineHeights.tight,
    fontFamily: fonts.semibold,
  },
  body: {
    fontSize: 16,
    fontWeight: typography.fontWeights.regular,
    lineHeight: 16 * typography.lineHeights.normal,
    fontFamily: fonts.regular,
  },
});
```

## Spacing

### Use Spacing Tokens

```typescript
import { spacing } from '../design-system/tokens/spacing';

const styles = StyleSheet.create({
  container: {
    padding: parseInt(spacing.md), // 16px
    gap: parseInt(spacing.lg), // 24px
  },
  card: {
    marginBottom: parseInt(spacing.md), // 16px
    borderRadius: parseInt(borderRadius.xl), // 16px
  },
});
```

## Components

### SwipeCard Implementation

```typescript
import React, { useRef } from 'react';
import { View, Animated, PanResponder, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const ROTATION_FACTOR = 0.1;

export const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipeLeft, onSwipeRight }) => {
  const { colors } = useTheme();
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
        rotate.setValue(gesture.dx * ROTATION_FACTOR);
        const distance = Math.abs(gesture.dx);
        opacity.setValue(Math.max(0.3, 1 - distance / 300));
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          if (gesture.dx > 0) {
            onSwipeRight();
          } else {
            onSwipeLeft();
          }
        } else {
          // Spring back
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
          Animated.spring(rotate, { toValue: 0, useNativeDriver: true }).start();
          Animated.spring(opacity, { toValue: 1, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate: rotateInterpolate },
          ],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Card content */}
    </Animated.View>
  );
};
```

### ActionButtons Implementation

```typescript
import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Heart, X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import * as Haptics from 'expo-haptics';

export const ActionButtons: React.FC<ActionButtonsProps> = ({ onLike, onDislike }) => {
  const { colors } = useTheme();
  const likeScale = useRef(new Animated.Value(1)).current;
  const dislikeScale = useRef(new Animated.Value(1)).current;

  const handlePress = (scale: Animated.Value, callback: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    callback();
  };

  return (
    <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center' }}>
      <TouchableOpacity
        onPress={() => handlePress(dislikeScale, onDislike)}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Animated.View style={{ transform: [{ scale: dislikeScale }] }}>
          <X size={24} color={colors.dislikeGray.reactNative} />
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handlePress(likeScale, onLike)}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <Heart size={24} color={colors.dislikeGray.reactNative} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};
```

### BottomNavigation Implementation

```typescript
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Home, MessageCircle, Settings } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const BottomNavigation = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const navItems = [
    { path: 'Home', icon: Home, label: 'Discover' },
    { path: 'Matches', icon: MessageCircle, label: 'Chat' },
    { path: 'Settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.card.reactNative }}>
      <View
        style={{
          height: 76,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: colors.border.reactNative,
          gap: 24,
        }}
      >
        {navItems.map((item) => {
          const isActive = route.name === item.path;
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.path}
              onPress={() => navigation.navigate(item.path as never)}
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Icon
                size={24}
                color={isActive ? colors.crimsonPulse.reactNative : colors.text.reactNative + 'B3'}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: isActive ? colors.crimsonPulse.reactNative : colors.text.reactNative + 'B3',
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};
```

## Safe Areas

### Implementation

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// Top safe area
<SafeAreaView edges={['top']} style={{ backgroundColor: colors.background.reactNative }}>
  {/* Content */}
</SafeAreaView>

// Bottom safe area
<SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.card.reactNative }}>
  {/* Navigation */}
</SafeAreaView>

// Both
<SafeAreaView edges={['top', 'bottom']}>
  {/* Content */}
</SafeAreaView>
```

## Platform-Specific Styles

```typescript
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: {
        paddingTop: 20,
      },
      android: {
        paddingTop: 0,
      },
    }),
  },
  shadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
```

## Animation Best Practices

1. **Use `useNativeDriver: true`** for transform and opacity animations
2. **Use `react-native-reanimated`** for complex animations
3. **Use `Animated.spring()`** for natural feel
4. **Avoid animating layout properties** (use transform instead)

## Performance Tips

1. **Use `React.memo()`** for components that don't change often
2. **Use `useMemo()`** for expensive calculations
3. **Use `FlatList`** for long lists (matches, messages)
4. **Optimize images** with proper sizing and caching
5. **Use `InteractionManager`** for non-critical animations

## Testing

### Component Testing

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { SwipeCard } from './SwipeCard';

test('swipes left on left gesture', () => {
  const onSwipeLeft = jest.fn();
  const { getByTestId } = render(
    <SwipeCard user={mockUser} onSwipeLeft={onSwipeLeft} />
  );
  
  // Simulate swipe gesture
  fireEvent.pan(getByTestId('swipe-card'), {
    nativeEvent: { translationX: -150 },
  });
  
  expect(onSwipeLeft).toHaveBeenCalled();
});
```

## Accessibility

### Add Accessibility Labels

```typescript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Like this profile"
  accessibilityRole="button"
  accessibilityHint="Double tap to like"
>
  <Heart size={24} />
</TouchableOpacity>
```

### Support Screen Readers

```typescript
<Text
  accessible={true}
  accessibilityRole="header"
  accessibilityLevel={1}
>
  Profile Name
</Text>
```

## Common Patterns

### Theme-Aware Styles

```typescript
const useStyles = () => {
  const { colors } = useTheme();
  
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background.reactNative,
      borderColor: colors.border.reactNative,
    },
    text: {
      color: colors.text.reactNative,
    },
  });
};
```

### Responsive Sizing

```typescript
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isTablet = width >= 768;

const cardWidth = isTablet ? 400 : width - 32;
```

