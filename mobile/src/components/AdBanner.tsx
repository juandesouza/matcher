import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';

// Conditionally import ads - only works in development builds, not Expo Go
let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const adsModule = require('react-native-google-mobile-ads');
  BannerAd = adsModule.BannerAd;
  BannerAdSize = adsModule.BannerAdSize;
  TestIds = adsModule.TestIds;
} catch (error) {
  // Module not available (e.g., in Expo Go) - this is expected
  console.log('Google Mobile Ads not available (expected in Expo Go)');
}

// Use test ID for development, replace with your actual ad unit ID in production
const AD_UNIT_ID = __DEV__ ? (TestIds?.BANNER || 'test') : 'ca-app-pub-3940256099942544/6300978111'; // Replace with your actual ad unit ID

export const AdBanner = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    adContainer: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholder: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.gray[700],
      borderRadius: parseInt(borderRadius.md),
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderText: {
      color: colors.text.reactNative,
      fontSize: parseInt(typography.fontSizes.sm),
      opacity: 0.5,
    },
  });

  // If ads module is not available (Expo Go), show placeholder
  if (!BannerAd || !BannerAdSize) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Ad placeholder</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.adContainer}>
        <BannerAd
          unitId={AD_UNIT_ID}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    </View>
  );
};

