import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Linking } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { MatchesScreen } from '../screens/MatchesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { MatchScreen } from '../screens/MatchScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { BottomNavigation } from '../components/BottomNavigation';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  console.log('========== AppNavigator RENDERING ==========');
  const navigationRef = useRef<any>(null);
  
  // Handle deep links globally
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log('AppNavigator: Deep link received:', event.url);
      
      if (event.url.includes('reset-password') || event.url.includes('resetPassword')) {
        try {
          const url = new URL(event.url);
          const token = url.searchParams.get('token');
          if (token && navigationRef.current) {
            console.log('AppNavigator: Navigating to ResetPassword with token');
            navigationRef.current.navigate('ResetPassword', { token });
          }
        } catch (error: any) {
          console.error('AppNavigator: Error parsing reset password deep link:', error);
        }
      } else if (event.url.includes('subscribe/success')) {
        try {
          const url = new URL(event.url);
          const sessionId = url.searchParams.get('session_id');
          if (sessionId && navigationRef.current) {
            console.log('AppNavigator: Subscription successful, verifying...');
            // Verify subscription with backend
            fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.109:5173'}/api/subscribe/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId }),
              credentials: 'include',
            }).then(() => {
              // Reload settings to reflect subscription status
              navigationRef.current?.navigate('Settings');
            }).catch(err => {
              console.error('Failed to verify subscription:', err);
            });
          }
        } catch (error: any) {
          console.error('AppNavigator: Error parsing subscription success deep link:', error);
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
  
  try {
    console.log('AppNavigator: Creating NavigationContainer...');
    return (
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="Setup" component={SetupScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Match" component={MatchScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  } catch (error) {
    console.error('========== AppNavigator: ERROR IN RENDER ==========');
    console.error('Error:', error);
    console.error('Error message:', (error as Error)?.message);
    console.error('Error stack:', (error as Error)?.stack);
    console.error('==================================================');
    throw error;
  }
};
