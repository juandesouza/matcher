import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useTheme as useThemeHook } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { settings, subscription } from '../utils/api';
import { Linking, Alert } from 'react-native';
import { Settings as SettingsType } from '../types';
import { Sun, Moon, User } from 'lucide-react-native';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';

export const SettingsScreen = () => {
  const { colors } = useTheme();
  const { theme, toggleTheme } = useThemeHook();
  const navigation = useNavigation();
  const [settingsData, setSettingsData] = useState<SettingsType>({
    ageRangeMin: 18,
    ageRangeMax: 35,
    distanceRange: 50,
    locale: 'en',
    theme: 'dark',
    isSubscribed: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settings.get();
      // Transform API response to match SettingsType
      // API returns ageRange: { min, max } but we need ageRangeMin/ageRangeMax
      setSettingsData({
        ageRangeMin: data.ageRange?.min ?? 18,
        ageRangeMax: data.ageRange?.max ?? 99,
        distanceRange: data.distanceRange ?? 50,
        locale: data.locale ?? 'en',
        theme: data.theme ?? 'dark',
        isSubscribed: data.isSubscribed ?? false,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<SettingsType>) => {
    try {
      const newSettings = { ...settingsData, ...updates };
      setSettingsData(newSettings);
      
      // Transform to API format (ageRange: { min, max })
      const apiUpdates: any = { ...updates };
      if (updates.ageRangeMin !== undefined || updates.ageRangeMax !== undefined) {
        apiUpdates.ageRange = {
          min: updates.ageRangeMin ?? newSettings.ageRangeMin,
          max: updates.ageRangeMax ?? newSettings.ageRangeMax,
        };
        delete apiUpdates.ageRangeMin;
        delete apiUpdates.ageRangeMax;
      }
      
      await settings.update(apiUpdates);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      const result = await subscription.createCheckout();
      if (result.sessionId) {
        // Open Stripe checkout in browser
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${result.sessionId}`;
        Linking.openURL(checkoutUrl).catch(err => {
          console.error('Failed to open checkout:', err);
          Alert.alert('Error', 'Failed to open payment page');
        });
      }
    } catch (error: any) {
      console.error('Failed to create checkout:', error);
      Alert.alert('Error', error.message || 'Failed to create checkout session');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.reactNative,
    },
    content: {
      padding: parseInt(spacing.md),
    },
    card: {
      backgroundColor: colors.card.reactNative,
      borderRadius: parseInt(borderRadius.xl),
      padding: parseInt(spacing.md),
      marginBottom: parseInt(spacing.md),
    },
    title: {
      fontSize: parseInt(typography.fontSizes.xl),
      fontWeight: typography.fontWeights.semibold,
      color: colors.text.reactNative,
      marginBottom: parseInt(spacing.sm),
    },
    input: {
      backgroundColor: theme === 'dark' ? '#2a2a2a' : colors.gray[200],
      borderRadius: parseInt(borderRadius.lg),
      paddingHorizontal: parseInt(spacing.md),
      paddingVertical: parseInt(spacing.sm),
      fontSize: parseInt(typography.fontSizes.base),
      color: colors.text.reactNative,
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#404040' : colors.border.reactNative,
    },
    themeButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme === 'dark' ? '#2a2a2a' : colors.gray[200],
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#404040' : colors.border.reactNative,
    },
    button: {
      backgroundColor: theme === 'dark' ? '#2a2a2a' : colors.gray[200],
      borderRadius: parseInt(borderRadius.lg),
      padding: parseInt(spacing.md),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: parseInt(spacing.md),
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#404040' : colors.border.reactNative,
    },
    buttonText: {
      color: colors.text.reactNative,
      fontSize: parseInt(typography.fontSizes.base),
      fontWeight: typography.fontWeights.semibold,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Theme</Text>
          <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
            {theme === 'dark' ? (
              <Sun size={24} color={colors.text.reactNative} />
            ) : (
              <Moon size={24} color={colors.text.reactNative} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Age Range</Text>
          <View style={{ flexDirection: 'row', gap: parseInt(spacing.sm) }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={settingsData.ageRangeMin?.toString() ?? '18'}
              onChangeText={(text) =>
                updateSettings({ ageRangeMin: parseInt(text) || 18 })
              }
              keyboardType="numeric"
              placeholder="Min"
              placeholderTextColor={colors.text.reactNative + '80'}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={settingsData.ageRangeMax?.toString() ?? '99'}
              onChangeText={(text) =>
                updateSettings({ ageRangeMax: parseInt(text) || 99 })
              }
              keyboardType="numeric"
              placeholder="Max"
              placeholderTextColor={colors.text.reactNative + '80'}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Distance Range (km)</Text>
          <TextInput
            style={styles.input}
            value={settingsData.distanceRange?.toString() ?? '50'}
            onChangeText={(text) =>
              updateSettings({ distanceRange: parseInt(text) || 50 })
            }
            keyboardType="numeric"
            placeholder="Distance in km"
            placeholderTextColor={colors.text.reactNative + '80'}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity
            style={[styles.button, { flexDirection: 'row', alignItems: 'center' }]}
            onPress={() => navigation.navigate('EditProfile' as never)}
          >
            <User size={20} color={colors.text.reactNative} style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {!settingsData.isSubscribed && (
          <View style={styles.card}>
            <Text style={styles.title}>Subscription</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.crimsonPulse.reactNative }]}
              onPress={handleSubscribe}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Subscribe to remove ads</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
