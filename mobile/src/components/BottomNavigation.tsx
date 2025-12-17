import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Home, MessageCircle, Settings } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';

export const BottomNavigation = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { colors } = useTheme();

  const navItems = [
    { name: 'Home', icon: Home, label: 'Discover' },
    { name: 'Matches', icon: MessageCircle, label: 'Chat' },
    { name: 'Settings', icon: Settings, label: 'Settings' },
  ];

  const styles = StyleSheet.create({
    container: {
      height: 76,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border.reactNative,
      backgroundColor: colors.card.reactNative,
      gap: parseInt(spacing.lg),
    },
    navItem: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingHorizontal: parseInt(spacing.md),
      paddingVertical: parseInt(spacing.sm),
    },
    icon: {
      opacity: 0.7,
    },
    activeIcon: {
      opacity: 1,
    },
    label: {
      fontSize: parseInt(typography.fontSizes.xs),
      opacity: 0.7,
    },
    activeLabel: {
      opacity: 1,
    },
  });

  return (
    <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.card.reactNative }}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isActive = state.index === index;
          
          // Find the nav item for this route
          const navItem = navItems.find(item => item.name === route.name);
          if (!navItem) return null;
          
          const Icon = navItem.icon;
          const iconColor = isActive ? colors.crimsonPulse.reactNative : colors.text.reactNative;
          const labelColor = isActive ? colors.crimsonPulse.reactNative : colors.text.reactNative;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.navItem}
            >
              <Icon
                size={24}
                color={iconColor}
                style={isActive ? styles.activeIcon : styles.icon}
              />
              <Text
                style={[
                  styles.label,
                  { color: labelColor },
                  isActive && styles.activeLabel,
                ]}
              >
                {navItem.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};
