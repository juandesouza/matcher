import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Heart, X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import * as Haptics from 'expo-haptics';
import { spacing } from '@design-system/tokens/spacing';

interface ActionButtonsProps {
  onLike: () => void;
  onDislike: () => void;
}

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

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: parseInt(spacing.md),
      justifyContent: 'center',
      marginTop: parseInt(spacing.sm),
    },
    button: {
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
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => handlePress(dislikeScale, onDislike)}
        style={styles.button}
      >
        <Animated.View style={{ transform: [{ scale: dislikeScale }] }}>
          <X size={24} color={colors.dislikeGray.reactNative} />
        </Animated.View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handlePress(likeScale, onLike)}
        style={styles.button}
      >
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <Heart size={24} color={colors.crimsonPulse.reactNative} fill={colors.crimsonPulse.reactNative} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};
