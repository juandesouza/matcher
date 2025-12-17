import React, { useRef, useState } from 'react';
import { View, Animated, PanResponder, Dimensions, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';
import { User } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50; // Lowered threshold for easier swiping
const ROTATION_FACTOR = 0.1;
const CARD_HEIGHT = 600;
const PHOTO_HEIGHT = 450;

interface SwipeCardProps {
  user: User;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onLike?: () => void;
  onDislike?: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  user,
  onSwipeLeft,
  onSwipeRight,
  onLike,
  onDislike,
}) => {
  const { colors } = useTheme();
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only capture if it's a horizontal swipe (not vertical scroll)
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture if it's a horizontal swipe (not vertical scroll)
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        // Reset pan values when gesture starts
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        pan.setValue({ x: gesture.dx, y: gesture.dy });
        rotate.setValue(gesture.dx * ROTATION_FACTOR);
        const distance = Math.abs(gesture.dx);
        opacity.setValue(Math.max(0.3, 1 - distance / 300));
      },
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        console.log('Swipe gesture released:', { dx: gesture.dx, dy: gesture.dy, threshold: SWIPE_THRESHOLD, velocity: gesture.vx });
        
        // Check both distance and velocity for better swipe detection
        const hasEnoughDistance = Math.abs(gesture.dx) > SWIPE_THRESHOLD;
        const hasEnoughVelocity = Math.abs(gesture.vx) > 0.5;
        
        if (hasEnoughDistance || hasEnoughVelocity) {
          const direction = gesture.dx > 0 ? 'right' : 'left';
          console.log('Swipe threshold exceeded, direction:', direction);
          
          // Call handler immediately (before animation) for better UX
          // This ensures the card disappears from the list right away
          console.log('Calling swipe handler immediately:', direction);
          if (gesture.dx > 0) {
            onSwipeRight();
          } else {
            onSwipeLeft();
          }
          
          // Animate card off screen
          const screenDirection = gesture.dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH;
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: screenDirection, y: gesture.dy },
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Reset for next card after animation completes
            pan.setValue({ x: 0, y: 0 });
            pan.setOffset({ x: 0, y: 0 });
            rotate.setValue(0);
            opacity.setValue(1);
          });
        } else {
          console.log('Swipe threshold not met, springing back');
          // Spring back
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start(() => {
            pan.setOffset({ x: 0, y: 0 });
          });
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

  const styles = StyleSheet.create({
    card: {
      width: SCREEN_WIDTH - 32,
      height: CARD_HEIGHT,
      borderRadius: parseInt(borderRadius.xl),
      backgroundColor: colors.card.reactNative,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    photoContainer: {
      width: '100%',
      height: PHOTO_HEIGHT,
      backgroundColor: colors.gray[800],
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    photoIndicators: {
      position: 'absolute',
      bottom: 16,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    indicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    activeIndicator: {
      backgroundColor: '#FFFFFF',
    },
    bioContainer: {
      padding: parseInt(spacing.md),
      flex: 1,
    },
    name: {
      fontSize: parseInt(typography.fontSizes.lg),
      fontWeight: typography.fontWeights.semibold,
      color: colors.text.reactNative,
      marginBottom: 4,
    },
    bio: {
      fontSize: parseInt(typography.fontSizes.base),
      fontWeight: typography.fontWeights.regular,
      color: colors.text.reactNative,
      lineHeight: parseInt(typography.fontSizes.base) * typography.lineHeights.normal,
    },
  });

  return (
    <Animated.View
      style={[
        styles.card,
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
      <View style={styles.photoContainer}>
        {user.photos && user.photos.length > 0 && (
          <Image
            source={{ uri: user.photos[currentPhotoIndex] }}
            style={styles.photo}
            resizeMode="cover"
          />
        )}
        {user.photos && user.photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {user.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentPhotoIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        )}
      </View>
      <View style={styles.bioContainer}>
        <Text style={styles.name}>
          {user.name}, {user.age}
        </Text>
        <Text style={styles.bio}>{user.bio}</Text>
      </View>
    </Animated.View>
  );
};
