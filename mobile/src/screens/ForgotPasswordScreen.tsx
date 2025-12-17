import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../utils/api';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';

export const ForgotPasswordScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setSuccess(false);
      
      const result = await auth.forgotPassword(email);
      
      setSuccess(true);
      
      // In development, if resetUrl is provided (email not configured), show it
      if (result.resetUrl) {
        Alert.alert(
          'Reset Link Generated',
          `Email not configured. Use this link to reset your password:\n\n${result.resetUrl}\n\nCheck the backend console for the full URL.`,
          [{ text: 'OK' }]
        );
        console.log('Password reset URL:', result.resetUrl);
      } else {
        Alert.alert('Email sent', 'Email sent successfully! Please check your inbox for password reset instructions.');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Failed to send reset email');
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
      marginBottom: parseSpacing(spacing.md),
      textAlign: 'center',
    },
    subtitle: {
      fontSize: parseFontSize(typography.fontSizes.base),
      color: colors.text.reactNative + 'CC',
      marginBottom: parseSpacing(spacing.xl),
      textAlign: 'center',
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
    successText: {
      color: '#4CAF50',
      fontSize: parseFontSize(typography.fontSizes.sm),
      marginBottom: parseSpacing(spacing.md),
      textAlign: 'center',
    },
    link: {
      marginTop: parseSpacing(spacing.md),
      textAlign: 'center',
    },
    linkText: {
      color: colors.crimsonPulse.reactNative,
      fontSize: parseFontSize(typography.fontSizes.base),
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {success ? <Text style={styles.successText}>Email sent successfully!</Text> : null}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.text.reactNative + '80'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!success}
      />
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleForgotPassword}
        disabled={isLoading || success}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Sending...' : success ? 'Email Sent' : 'Send Reset Link'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate('Login' as never)}
      >
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

