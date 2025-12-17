import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius } from '@design-system/tokens/spacing';

export const BackButton = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const styles = StyleSheet.create({
    button: {
      position: 'absolute',
      top: parseInt(spacing.md),
      left: parseInt(spacing.md),
      zIndex: 50,
      width: 40,
      height: 40,
      borderRadius: parseInt(borderRadius.full),
      backgroundColor: colors.card.reactNative,
      borderWidth: 1,
      borderColor: colors.border.reactNative,
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
    <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, zIndex: 50 }}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.button}
      >
        <ArrowLeft size={24} color={colors.text.reactNative} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};
