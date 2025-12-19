import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Eye, EyeOff } from 'lucide-react-native';
import { auth, user } from '../utils/api';
import { spacing, borderRadius } from '@design-system/tokens/spacing';
import { typography } from '@design-system/tokens/typography';

// Complete the web browser authentication session
WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = () => {
  console.log('========== LoginScreen RENDERING ==========');
  const { colors } = useTheme();
  console.log('LoginScreen: Colors loaded:', !!colors);
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestUserLoading, setIsTestUserLoading] = useState(false);
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
        navigation.navigate('Main' as never);
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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await auth.login(email, password);
      
      // Check if profile is complete (has age and gender)
      try {
        const profile = await user.getProfile();
        if (!profile.age || !profile.gender) {
          // Profile incomplete, redirect to setup
          navigation.navigate('Setup' as never);
        } else {
          // Profile complete, navigate to main app
          navigation.navigate('Main' as never);
        }
      } catch (profileError: any) {
        console.error('Error checking profile:', profileError);
        // If we can't check profile, assume incomplete and go to setup
        navigation.navigate('Setup' as never);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
      Alert.alert('Login Error', error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUserLogin = async () => {
    try {
      setIsTestUserLoading(true);
      setError('');
      await auth.testUser();
      
      // Test user always has complete profile, navigate to main app
      navigation.navigate('Main' as never);
    } catch (error: any) {
      console.error('Test user login error:', error);
      setError(error.message || 'Failed to create test user');
      Alert.alert('Test User Error', error.message || 'Failed to create test user');
    } finally {
      setIsTestUserLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      console.error('Google login error:', error);
      setError(error.message || 'Google login failed');
      Alert.alert('Google Login Error', error.message || 'Google login failed');
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
      minHeight: 48, // Ensure inputs are visible
      width: '100%', // Ensure full width
    },
    button: {
      backgroundColor: colors.crimsonPulse.reactNative,
      borderRadius: parseSpacing(borderRadius.lg),
      padding: parseSpacing(spacing.md),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: parseSpacing(spacing.md),
      minHeight: 48, // Ensure button is visible
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: parseFontSize(typography.fontSizes.base),
      fontWeight: typography.fontWeights.semibold.toString() as any,
    },
    link: {
      marginTop: parseSpacing(spacing.md),
      textAlign: 'center',
    },
    linkText: {
      color: colors.crimsonPulse.reactNative,
      fontSize: parseFontSize(typography.fontSizes.base),
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
    forgotPasswordLink: {
      alignSelf: 'flex-end',
      marginBottom: parseSpacing(spacing.md),
    },
    forgotPasswordText: {
      color: colors.crimsonPulse.reactNative,
      fontSize: parseFontSize(typography.fontSizes.sm),
    },
    testUserButton: {
      backgroundColor: colors.card.reactNative,
      borderRadius: parseSpacing(borderRadius.lg),
      padding: parseSpacing(spacing.md),
      alignItems: 'center',
      marginTop: parseSpacing(spacing.md),
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.border.reactNative,
    },
    testUserButtonText: {
      color: colors.text.reactNative,
      fontSize: parseFontSize(typography.fontSizes.base),
      fontWeight: typography.fontWeights.medium.toString() as any,
    },
    testUserHint: {
      color: colors.text.reactNative + '80',
      fontSize: parseFontSize(typography.fontSizes.xs),
      textAlign: 'center',
      marginTop: parseSpacing(spacing.xs),
      marginBottom: parseSpacing(spacing.sm),
      paddingHorizontal: parseSpacing(spacing.md),
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Matcher</Text>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
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
      <TouchableOpacity
        style={styles.forgotPasswordLink}
        onPress={() => navigation.navigate('ForgotPassword' as never)}
      >
        <Text style={styles.forgotPasswordText}>Forgot my password</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.buttonLoading}>
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Logging in...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>
      
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleLogin}
        disabled={isLoading}
      >
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>
      
      <TouchableOpacity
        style={[styles.testUserButton, isTestUserLoading && styles.buttonDisabled]}
        onPress={handleTestUserLogin}
        disabled={isTestUserLoading}
      >
        {isTestUserLoading ? (
          <View style={styles.buttonLoading}>
            <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.testUserButtonText}>Creating test account...</Text>
          </View>
        ) : (
          <Text style={styles.testUserButtonText}>Enter as Test User</Text>
        )}
      </TouchableOpacity>
      <Text style={styles.testUserHint}>
        Explore the app without signing up. Data will be deleted after 24 hours.
      </Text>
      
      <TouchableOpacity
        style={styles.link}
        onPress={() => navigation.navigate('Signup' as never)}
      >
        <Text style={styles.linkText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
