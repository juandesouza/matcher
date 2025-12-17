import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Eye, EyeOff } from 'lucide-react-native';
import { auth } from '../utils/api';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';

export const ResetPasswordScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const routeToken = (route.params as any)?.token || '';
  
  const [token, setToken] = useState(routeToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle deep links for password reset
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.includes('reset-password') || event.url.includes('resetPassword')) {
        try {
          const url = new URL(event.url);
          const tokenParam = url.searchParams.get('token');
          if (tokenParam) {
            setToken(tokenParam);
          }
        } catch (error: any) {
          console.error('Error parsing reset password deep link:', error);
        }
      }
    };

    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!token) {
      Alert.alert('Invalid Link', 'This password reset link is invalid or has expired.');
      navigation.navigate('Login' as never);
    }
  }, [token, navigation]);

  const handleResetPassword = async () => {
    if (!password.trim()) {
      setError('Password is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      await auth.resetPassword(token, password);
      
      Alert.alert('Success', 'Password reset successfully! You can now login with your new password.', [
        { text: 'OK', onPress: () => navigation.navigate('Login' as never) }
      ]);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const parseSpacing = (value: string) => parseInt(value.replace('px', ''), 10);
  const parseFontSize = (value: string) => parseInt(value.replace('px', ''), 10);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.reactNative,
      justifyContent: 'center',
      padding: parseSpacing(spacing.xl),
    },
    title: {
      fontSize: parseFontSize(typography.fontSizes['2xl']),
      fontWeight: typography.fontWeights.bold.toString() as any,
      color: colors.text.reactNative,
      marginBottom: parseSpacing(spacing.xl),
      textAlign: 'center',
    },
    passwordContainer: {
      position: 'relative',
      width: '100%',
      marginBottom: parseSpacing(spacing.md),
    },
    input: {
      backgroundColor: colors.card.reactNative,
      borderRadius: parseSpacing(borderRadius.lg),
      padding: parseSpacing(spacing.md),
      fontSize: parseFontSize(typography.fontSizes.base),
      color: colors.text.reactNative,
      marginBottom: parseSpacing(spacing.md),
      borderWidth: 1,
      borderColor: colors.border.reactNative,
      minHeight: 48,
      width: '100%',
    },
    passwordInput: {
      paddingRight: 50,
    },
    eyeIcon: {
      position: 'absolute',
      right: parseSpacing(spacing.md),
      top: '50%',
      transform: [{ translateY: -10 }],
      padding: parseSpacing(spacing.xs),
    },
    button: {
      backgroundColor: colors.crimsonPulse.reactNative,
      borderRadius: parseSpacing(borderRadius.lg),
      padding: parseSpacing(spacing.md),
      alignItems: 'center',
      marginTop: parseSpacing(spacing.md),
      minHeight: 48,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: parseFontSize(typography.fontSizes.base),
      fontWeight: typography.fontWeights.semibold.toString() as any,
    },
    errorText: {
      color: '#ff4444',
      fontSize: parseFontSize(typography.fontSizes.sm),
      marginBottom: parseSpacing(spacing.md),
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="New Password"
          placeholderTextColor={colors.text.reactNative + '80'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color={colors.text.reactNative} />
          ) : (
            <Eye size={20} color={colors.text.reactNative} />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Confirm New Password"
          placeholderTextColor={colors.text.reactNative + '80'}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <EyeOff size={20} color={colors.text.reactNative} />
          ) : (
            <Eye size={20} color={colors.text.reactNative} />
          )}
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Resetting...' : 'Reset Password'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

