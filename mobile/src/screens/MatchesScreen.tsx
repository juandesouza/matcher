import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { matches } from '../utils/api';
import { Match } from '../types';
import { MessageCircle } from 'lucide-react-native';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';

export const MatchesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [matchesList, setMatchesList] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMatches();
    
    // Reload matches when screen comes into focus (e.g., after a new match)
    const unsubscribe = navigation.addListener('focus', () => {
      loadMatches();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadMatches = async () => {
    try {
      setIsLoading(true);
      console.log('[MatchesScreen] Loading matches...');
      const data = await matches.getAll();
      console.log('[MatchesScreen] Matches API response:', data);
      console.log('[MatchesScreen] Number of matches:', data.matches?.length || 0);
      setMatchesList(data.matches || []);
    } catch (error) {
      console.error('[MatchesScreen] Failed to load matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchPress = async (matchId: string) => {
    try {
      // Get chat ID from match ID
      const data = await matches.getChatId(matchId);
      navigation.navigate('Chat' as never, { chatId: data.chatId } as never);
    } catch (error) {
      console.error('Failed to get chat ID:', error);
      // Fallback: try navigating with matchId as chatId (for backwards compatibility)
      navigation.navigate('Chat' as never, { chatId: matchId } as never);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.reactNative,
    },
    matchCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: parseInt(spacing.md),
      backgroundColor: colors.card.reactNative,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.reactNative,
      gap: parseInt(spacing.md),
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.gray[300],
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: parseInt(typography.fontSizes.lg),
      fontWeight: typography.fontWeights.semibold,
      color: colors.text.reactNative,
      marginBottom: 4,
    },
    age: {
      fontSize: parseInt(typography.fontSizes.sm),
      color: colors.text.reactNative,
      opacity: 0.6,
    },
    button: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.crimsonPulse.reactNative,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => handleMatchPress(item.id)}
    >
      <Image
        source={{ 
          uri: item.user.photos && item.user.photos.length > 0
            ? (item.user.photos[0].startsWith('http') 
                ? item.user.photos[0] 
                : `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.109:5173'}${item.user.photos[0]}`)
            : ''
        }}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{item.user.name}</Text>
        <Text style={styles.age}>{item.user.age} years old</Text>
      </View>
      <View style={styles.button}>
        <MessageCircle size={24} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={matchesList}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={loadMatches}
      />
    </SafeAreaView>
  );
};
