import React, { useRef } from 'react';
import { View, Animated, PanResponder, Dimensions, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';
import { Heart, X } from 'lucide-react-native';
import { AdBanner } from './AdBanner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;
const ROTATION_FACTOR = 0.1;
const CARD_HEIGHT = 600;
const PHOTO_HEIGHT = 450;

interface AdCardProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  adUrl?: string; // URL to open when ad is clicked/swiped right
}

export const AdCard: React.FC<AdCardProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onLike,
  onDislike,
  adUrl,
}) => {
  const { colors } = useTheme();
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
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
        
        const hasEnoughDistance = Math.abs(gesture.dx) > SWIPE_THRESHOLD;
        const hasEnoughVelocity = Math.abs(gesture.vx) > 0.5;
        
        if (hasEnoughDistance || hasEnoughVelocity) {
          const direction = gesture.dx > 0 ? 'right' : 'left';
          
          // Call handler immediately
          if (gesture.dx > 0) {
            // Swipe right - open ad URL
            if (adUrl) {
              Linking.openURL(adUrl).catch(err => console.error('Failed to open ad URL:', err));
            }
            onSwipeRight();
          } else {
            // Swipe left - dismiss ad
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
            pan.setValue({ x: 0, y: 0 });
            pan.setOffset({ x: 0, y: 0 });
            rotate.setValue(0);
            opacity.setValue(1);
          });
        } else {
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

  const handleLike = () => {
    if (adUrl) {
      Linking.openURL(adUrl).catch(err => console.error('Failed to open ad URL:', err));
    }
    onSwipeRight();
    if (onLike) onLike();
  };

  const handleDislike = () => {
    onSwipeLeft();
    if (onDislike) onDislike();
  };

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
    adContainer: {
      width: '100%',
      height: PHOTO_HEIGHT,
      backgroundColor: colors.gray[800],
      justifyContent: 'center',
      alignItems: 'center',
    },
    bioContainer: {
      padding: parseInt(spacing.md),
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    adText: {
      fontSize: parseInt(typography.fontSizes.lg),
      fontWeight: typography.fontWeights.semibold,
      color: colors.text.reactNative,
      textAlign: 'center',
      marginBottom: parseInt(spacing.sm),
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
      <View style={styles.adContainer}>
        <AdBanner />
      </View>
      <View style={styles.bioContainer}>
        <Text style={styles.adText}>Advertisement</Text>
      </View>
    </Animated.View>
  );
};

