import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { SwipeCard } from '../components/SwipeCard';
import { ActionButtons } from '../components/ActionButtons';
import { AdCard } from '../components/AdCard';
import { cards, swipes, location as locationApi, user } from '../utils/api';
import { User } from '../types';
import * as Location from 'expo-location';
import { spacing } from '@design-system/tokens/spacing';

export const HomeScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [cardsList, setCardsList] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCards();
    updateLocation();
  }, []);

  const updateLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      await locationApi.update(
        location.coords.latitude,
        location.coords.longitude
      );
    } catch (error) {
      console.error('Location update error:', error);
    }
  };

  const loadCards = async () => {
    try {
      setIsLoading(true);
      const data = await cards.get();
      console.log('Cards loaded:', data.cards?.length || 0, 'cards');
      setCardsList(data.cards || []);
      
      // If no cards available and we've swiped through all cards, auto-clear test data
      if ((!data.cards || data.cards.length === 0) && currentIndex > 0) {
        console.log('[HomeScreen] No more cards available, auto-clearing test data...');
        try {
          await user.clearTestData();
          console.log('[HomeScreen] Test data cleared, reloading cards...');
          // Reload cards after clearing
          const newData = await cards.get();
          setCardsList(newData.cards || []);
          setCurrentIndex(0); // Reset to first card
          console.log('[HomeScreen] Reloaded cards:', newData.cards?.length || 0, 'cards');
        } catch (error) {
          console.error('[HomeScreen] Failed to clear test data:', error);
        }
      }
      
      if (!data.cards || data.cards.length === 0) {
        console.warn('No cards returned from API. Check backend logs for details.');
      }
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate the actual user card index accounting for ad cards
  // Ad cards appear at positions 2, 4, 6, etc. (every 2 cards after the first)
  // So position 0 = user 0, position 1 = user 1, position 2 = ad, position 3 = user 2, etc.
  const getActualCardIndex = (index: number): number => {
    if (index === 0) return 0;
    if (index === 1) return 1;
    // For index >= 2, subtract the number of ad cards that appear before this position
    // Ad cards are at positions 2, 4, 6, 8, etc.
    const adCardsBefore = Math.floor((index - 1) / 2);
    return index - adCardsBefore;
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    // Check if we're on an ad card
    const isAdCard = currentIndex > 0 && currentIndex % 2 === 0;
    
    if (isAdCard) {
      // For ad cards, just move to next card without API call
      console.log('[HomeScreen] Ad card swipe:', direction);
      setCurrentIndex(currentIndex + 1);
      return;
    }

    // Calculate actual user card index
    const actualCardIndex = getActualCardIndex(currentIndex);
    
    if (actualCardIndex >= cardsList.length) {
      console.log('[HomeScreen] No more cards available');
      return;
    }

    const currentCard = cardsList[actualCardIndex];
    const action = direction === 'right' ? 'like' : 'dislike';

    try {
      console.log('[HomeScreen] Sending swipe:', { targetUserId: currentCard.id, action, actualCardIndex, currentIndex });
      
      // Move to next card immediately (before API call) so card disappears right away
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      const result = await swipes.create(currentCard.id, action);
      console.log('[HomeScreen] Swipe result:', JSON.stringify(result, null, 2));
      
      if (result.isMatch && result.matchId && result.matchedUser) {
        console.log('[HomeScreen] Match detected! Navigating to Match screen');
        console.log('[HomeScreen] Match details:', { matchId: result.matchId, matchedUser: result.matchedUser.name });
        // Navigate to match screen
        navigation.navigate('Match' as never, { 
          matchId: result.matchId,
          matchedUser: result.matchedUser
        } as never);
      } else {
        console.log('[HomeScreen] No match, already moved to next card');
      }

      // Preload more cards if needed (check actual card index)
      const nextActualIndex = getActualCardIndex(nextIndex);
      if (nextActualIndex + 2 >= cardsList.length) {
        await loadCards();
      }
    } catch (error) {
      console.error('Swipe error:', error);
      // Index was already incremented, so we're good
    }
  };

  const handleLike = () => {
    const isAdCard = currentIndex > 0 && currentIndex % 2 === 0;
    
    if (isAdCard) {
      // Open ad URL when liking/swiping right on ad
      const adUrl = 'https://example.com/ad'; // Placeholder URL
      Linking.openURL(adUrl).catch(err => {
        console.error('Failed to open ad URL:', err);
      });
      // Move to next card
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSwipe('right');
    }
  };

  const handleDislike = () => {
    const isAdCard = currentIndex > 0 && currentIndex % 2 === 0;
    
    if (isAdCard) {
      // Just move to next card when disliking ad
      setCurrentIndex(currentIndex + 1);
    } else {
      handleSwipe('left');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.reactNative,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: parseInt(spacing.md),
    },
    adContainer: {
      width: '100%',
      maxWidth: 320, // Standard ad banner width
      marginBottom: parseInt(spacing.md),
      alignSelf: 'center',
    },
    cardContainer: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonsContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: parseInt(spacing.md),
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={{ color: colors.text.reactNative }}>Loading cards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if we've run out of user cards (accounting for ad cards)
  const actualCardIndex = getActualCardIndex(currentIndex);
  const isAdCard = currentIndex > 0 && currentIndex % 2 === 0;
  
  if (!isAdCard && actualCardIndex >= cardsList.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={{ color: colors.text.reactNative, textAlign: 'center', padding: 20, fontSize: 16 }}>
            {cardsList.length === 0 
              ? 'No more matchers to show at the moment' 
              : 'No more matchers to show at the moment'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show ad every 2 cards (after 2nd, 4th, 6th, etc.)
  // Ad appears instead of a card at positions 2, 4, 6, etc.
  // Recalculate since we already calculated above
  const isAdCardDisplay = currentIndex > 0 && currentIndex % 2 === 0;
  
  // Calculate actual user card index for display
  const actualCardIndexDisplay = getActualCardIndex(currentIndex);
  const hasUserCard = !isAdCardDisplay && actualCardIndexDisplay < cardsList.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {isAdCardDisplay ? (
          <>
            <View style={styles.cardContainer}>
              <AdCard
                onSwipeLeft={handleDislike}
                onSwipeRight={handleLike}
                onLike={handleLike}
                onDislike={handleDislike}
                adUrl="https://example.com/ad"
              />
            </View>
            <View style={styles.buttonsContainer}>
              <ActionButtons onLike={handleLike} onDislike={handleDislike} />
            </View>
          </>
        ) : hasUserCard ? (
          <>
            <View style={styles.cardContainer}>
              <SwipeCard
                user={cardsList[actualCardIndexDisplay]}
                onSwipeLeft={handleDislike}
                onSwipeRight={handleLike}
                onLike={handleLike}
                onDislike={handleDislike}
              />
            </View>
            <View style={styles.buttonsContainer}>
              <ActionButtons onLike={handleLike} onDislike={handleDislike} />
            </View>
          </>
        ) : (
          <View style={styles.content}>
            <Text style={{ color: colors.text.reactNative, textAlign: 'center', padding: 20, fontSize: 16 }}>
              No more matchers to show at the moment
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
