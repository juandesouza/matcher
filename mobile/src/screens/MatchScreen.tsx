import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { matches } from '../utils/api';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';
import { User } from '../types';

export const MatchScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const matchedUser = (route.params as any)?.matchedUser as User;
  const matchId = (route.params as any)?.matchId as string;

  const handleStartChat = async () => {
    try {
      // Get chat ID from match ID
      const data = await matches.getChatId(matchId);
      navigation.navigate('Chat' as never, { chatId: data.chatId } as never);
    } catch (error) {
      console.error('Failed to get chat ID:', error);
      // Still navigate, ChatScreen will handle the error
      navigation.navigate('Chat' as never, { matchId } as never);
    }
  };

  const handleContinueSwiping = () => {
    // Go back to HomeScreen and continue swiping
    navigation.goBack();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.reactNative,
      justifyContent: 'center',
      alignItems: 'center',
      padding: parseInt(spacing.xl),
    },
    title: {
      fontSize: parseInt(typography.fontSizes['3xl']),
      fontWeight: typography.fontWeights.bold,
      color: colors.matchGreen?.reactNative || '#4CAF50',
      marginBottom: parseInt(spacing.xl),
      textAlign: 'center',
    },
    subtitle: {
      fontSize: parseInt(typography.fontSizes.lg),
      color: colors.text.reactNative,
      marginBottom: parseInt(spacing.xl),
      textAlign: 'center',
      opacity: 0.8,
    },
    avatarContainer: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: colors.gray[300],
      marginBottom: parseInt(spacing.xl),
      overflow: 'hidden',
      borderWidth: 4,
      borderColor: colors.matchGreen?.reactNative || '#4CAF50',
    },
    avatar: {
      width: '100%',
      height: '100%',
    },
    name: {
      fontSize: parseInt(typography.fontSizes['2xl']),
      fontWeight: typography.fontWeights.bold,
      color: colors.text.reactNative,
      marginBottom: parseInt(spacing.md),
      textAlign: 'center',
    },
    buttonContainer: {
      width: '100%',
      gap: parseInt(spacing.md),
    },
    primaryButton: {
      backgroundColor: colors.crimsonPulse.reactNative,
      borderRadius: parseInt(borderRadius.lg),
      padding: parseInt(spacing.md),
      alignItems: 'center',
      minHeight: 48,
    },
    secondaryButton: {
      backgroundColor: colors.card.reactNative,
      borderRadius: parseInt(borderRadius.lg),
      padding: parseInt(spacing.md),
      alignItems: 'center',
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border.reactNative,
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: parseInt(typography.fontSizes.base),
      fontWeight: typography.fontWeights.semibold,
    },
    secondaryButtonText: {
      color: colors.text.reactNative,
      fontSize: parseInt(typography.fontSizes.base),
      fontWeight: typography.fontWeights.semibold,
    },
  });

  if (!matchedUser) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Match!</Text>
        <Text style={styles.subtitle}>You have a new match!</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueSwiping}>
          <Text style={styles.secondaryButtonText}>Continue Swiping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>It's a Match! 🎉</Text>
      <Text style={styles.subtitle}>You and {matchedUser.name} liked each other</Text>
      
      <View style={styles.avatarContainer}>
        {matchedUser.photos && matchedUser.photos.length > 0 && (
          <Image
            source={{ 
              uri: matchedUser.photos[0].startsWith('http') 
                ? matchedUser.photos[0] 
                : `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.109:5173'}${matchedUser.photos[0]}`
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
        )}
      </View>
      
      <Text style={styles.name}>{matchedUser.name}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleStartChat}>
          <Text style={styles.primaryButtonText}>Start Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueSwiping}>
          <Text style={styles.secondaryButtonText}>Continue Swiping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

