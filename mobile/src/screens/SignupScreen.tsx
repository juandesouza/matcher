import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Eye, EyeOff } from 'lucide-react-native';
import { auth } from '../utils/api';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';

// Complete the web browser authentication session
WebBrowser.maybeCompleteAuthSession();

export const SignupScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Listen for deep links (for OAuth callback from backend redirect)
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log('Deep link received:', event.url);
      if (event.url.startsWith('matcher://auth/callback')) {
        try {
          const url = new URL(event.url);
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');
          
          if (error) {
            console.error('OAuth error from deep link:', error);
            setError(`OAuth error: ${error}`);
            return;
          }
          
          if (code) {
            const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.109:5173';
            await handleOAuthCode(code, `${API_BASE_URL}/api/auth/google/callback`);
          }
        } catch (error: any) {
          console.error('Error handling OAuth deep link:', error);
          setError(error.message || 'Failed to process OAuth callback');
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
  }, [navigation]);

  // Helper function to handle OAuth code
  const handleOAuthCode = async (code: string, redirectUri: string) => {
    try {
      setIsLoading(true);
      console.log('OAuth code received, exchanging for session...');
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.109:5173';
      const response = await fetch(`${API_BASE_URL}/api/auth/google/mobile/callback?code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`, {
        method: 'GET',
        credentials: 'include', // Important: include cookies
      });
      
      if (response.ok) {
        // Session created, verify and navigate
        await auth.check();
        navigation.navigate('Setup' as never);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to complete OAuth');
      }
    } catch (error: any) {
      console.error('Error processing OAuth code:', error);
      setError(error.message || 'Failed to process OAuth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
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
      await auth.signup(email, password, name);
      // Navigate to setup
      navigation.navigate('Setup' as never);
    } catch (error: any) {
      console.error('Signup error:', error);
      const errorMessage = error.message || 'Signup failed. Please try again.';
      
      // Check if it's an "already registered" error
      if (errorMessage.toLowerCase().includes('already registered') || 
          errorMessage.toLowerCase().includes('email already')) {
        const message = 'This email is already registered. Please try logging in instead.';
        setError(message);
        Alert.alert('Email Already Exists', message);
      } else {
        setError(errorMessage);
        Alert.alert('Signup Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Get OAuth URL from backend (backend will use its callback URL)
      // The backend callback will redirect to the deep link matcher://auth/callback
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.109:5173';
      const authUrlData = await auth.getGoogleAuthUrl();
      const authUrl = authUrlData.authUrl;
      const redirectUri = authUrlData.redirectUri;
      
      console.log('Opening Google OAuth URL:', authUrl);
      console.log('Backend redirect URI:', redirectUri);
      
      // Open the OAuth URL in browser
      // The backend callback will redirect to matcher://auth/callback
      // which will be caught by the deep link listener
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      console.log('WebBrowser result:', result.type);
      
      if (result.type === 'dismiss') {
        console.log('User dismissed OAuth');
      } else if (result.type === 'locked') {
        setError('OAuth session is locked');
      }
      
      // The actual OAuth code will come via deep link (handled by useEffect listener)
    } catch (error: any) {
      console.error('Google signup error:', error);
      setError(error.message || 'Google signup failed');
      Alert.alert('Google Signup Error', error.message || 'Google signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to parse spacing values (removes 'px' and converts to number)
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
      fontSize: parseFontSize(typography.fontSizes['3xl']),
      fontWeight: typography.fontWeights.bold.toString() as any,
      color: colors.text.reactNative,
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
    googleButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: parseSpacing(borderRadius.lg),
      padding: parseSpacing(spacing.md),
      alignItems: 'center',
      marginTop: parseSpacing(spacing.md),
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border.reactNative,
    },
    googleButtonText: {
      color: '#000000',
      fontSize: parseFontSize(typography.fontSizes.base),
      fontWeight: typography.fontWeights.medium.toString() as any,
    },
    link: {
      marginTop: parseSpacing(spacing.md),
      textAlign: 'center',
    },
    linkText: {
      color: colors.crimsonPulse.reactNative,
      fontSize: parseFontSize(typography.fontSizes.base),
    },
    errorText: {
      color: '#ff4444',
      fontSize: parseFontSize(typography.fontSizes.sm),
      marginBottom: parseSpacing(spacing.md),
      textAlign: 'center',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: parseSpacing(spacing.md),
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border.reactNative,
    },
    dividerText: {
      marginHorizontal: parseSpacing(spacing.md),
      color: colors.text.reactNative,
      fontSize: parseFontSize(typography.fontSizes.sm),
    },
    passwordContainer: {
      position: 'relative',
      width: '100%',
      marginBottom: parseSpacing(spacing.md),
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
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor={colors.text.reactNative + '80'}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.text.reactNative + '80'}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.passwordContainer}>
      <TextInput
          style={[styles.input, styles.passwordInput]}
        placeholder="Password"
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
          placeholder="Confirm Password"
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
        onPress={handleSignup}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Signing up...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>
      
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignup}
        disabled={isLoading}
      >
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate('Login' as never)}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
