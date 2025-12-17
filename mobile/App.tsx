import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Initialize Google Mobile Ads only in production builds (not Expo Go)
// Expo Go doesn't support native modules like react-native-google-mobile-ads
// We'll skip initialization in Expo Go to prevent crashes
try {
  // Only try to initialize if we're not in Expo Go
  // In Expo Go, this module won't be available and will throw an error
  const { mobileAds } = require('react-native-google-mobile-ads');
  if (mobileAds) {
    mobileAds()
      .initialize()
      .then((adapterStatuses: any) => {
        console.log('Google Mobile Ads initialized:', adapterStatuses);
      })
      .catch((error: any) => {
        console.error('Failed to initialize Google Mobile Ads:', error);
      });
  }
} catch (error) {
  // Module not available (e.g., in Expo Go) - this is expected and safe to ignore
  console.log('Google Mobile Ads not available (expected in Expo Go)');
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console (this will show in Metro bundler terminal)
    const errorMessage = `Error: ${error.message}\n\nComponent Stack:\n${errorInfo.componentStack}\n\nStack:\n${error.stack}`;
    
    console.error('========== ERROR BOUNDARY CAUGHT ERROR ==========');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('================================================');
    
    // Also show alert to ensure user sees it
    try {
      Alert.alert(
        'App Error',
        `Error: ${error.message}\n\nCheck terminal for full details.`,
        [{ text: 'OK' }]
      );
    } catch (alertError) {
      // If Alert fails, at least we logged it
      console.error('Failed to show alert:', alertError);
    }
    
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <ScrollView style={styles.errorScroll}>
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.toString()}
            </Text>
            {this.state.errorInfo && (
              <Text style={styles.errorStack}>
                {this.state.errorInfo.componentStack}
              </Text>
            )}
            {this.state.error?.stack && (
              <Text style={styles.errorStack}>
                {this.state.error.stack}
              </Text>
            )}
            <Text style={styles.errorHint}>
              Check the terminal where Metro bundler is running for detailed error logs.
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('========== App: Preparing app ==========');
        // Pre-load fonts, make any API calls you need to do here
        // For now, just wait a bit to ensure everything is loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('========== App: App ready, hiding splash ==========');
      } catch (e) {
        console.error('App preparation error:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        // Hide the splash screen
        await SplashScreen.hideAsync();
        console.log('========== App: Splash screen hidden ==========');
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null; // Return null while splash screen is showing
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  console.log('========== App() FUNCTION CALLED ==========');
  
  // Set up global error handlers to log to console
  // ErrorUtils is a React Native global for error handling
  if (typeof (global as any).ErrorUtils !== 'undefined') {
    const ErrorUtils = (global as any).ErrorUtils;
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      console.error('========== GLOBAL ERROR HANDLER ==========');
      console.error('Fatal:', isFatal);
      console.error('Error:', error);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      console.error('==========================================');
      
      // Also show alert for fatal errors
      if (isFatal) {
        try {
          Alert.alert(
            'Fatal Error',
            `Fatal Error: ${error.message}\n\nCheck terminal for full details.`,
            [{ text: 'OK' }]
          );
        } catch (alertError) {
          console.error('Failed to show alert:', alertError);
        }
      }
      
      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
    console.log('Global error handler set up');
  } else {
    console.warn('ErrorUtils not available');
  }

  console.log('Rendering App component...');
  
  try {
    return (
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('========== ERROR IN App() RENDER ==========');
    console.error('Error:', error);
    console.error('Error message:', (error as Error)?.message);
    console.error('Error stack:', (error as Error)?.stack);
    console.error('===========================================');
    throw error;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 60,
  },
  errorScroll: {
    flex: 1,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  errorHint: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
