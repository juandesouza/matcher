import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@design-system/tokens/colors';

type Theme = 'light' | 'dark';

// Create a type that includes both theme colors and root-level colors
type ThemeColors = (typeof colors.light | typeof colors.dark) & {
  crimsonPulse: typeof colors.crimsonPulse;
  rubyEmber: typeof colors.rubyEmber;
  matchGreen: typeof colors.matchGreen;
  dislikeGray: typeof colors.dislikeGray;
  gray: typeof colors.gray;
};

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('========== ThemeProvider RENDERING ==========');
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    console.log('ThemeProvider: useEffect called, loading theme...');
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      console.log('ThemeProvider: Attempting to load theme from AsyncStorage...');
      const savedTheme = await AsyncStorage.getItem('matcher-theme');
      console.log('ThemeProvider: Saved theme from storage:', savedTheme);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
        console.log('ThemeProvider: Theme set to:', savedTheme);
      } else {
        console.log('ThemeProvider: No valid saved theme, using default (dark)');
      }
    } catch (error) {
      console.error('========== ThemeProvider: Failed to load theme ==========');
      console.error('Error:', error);
      console.error('Error message:', (error as Error)?.message);
      console.error('Error stack:', (error as Error)?.stack);
      console.error('========================================================');
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      await AsyncStorage.setItem('matcher-theme', newTheme);
      // TODO: Also save to backend via API
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  console.log('ThemeProvider: Getting theme colors for theme:', theme);
  let themeColors: ThemeColors;
  try {
    const baseColors = theme === 'light' ? colors.light : colors.dark;
    // Merge theme colors with root-level color properties
    themeColors = {
      ...baseColors,
      crimsonPulse: colors.crimsonPulse,
      rubyEmber: colors.rubyEmber,
      matchGreen: colors.matchGreen,
      dislikeGray: colors.dislikeGray,
      gray: colors.gray,
    } as ThemeColors;
    console.log('ThemeProvider: Theme colors loaded successfully');
  } catch (error) {
    console.error('========== ThemeProvider: Failed to get theme colors ==========');
    console.error('Error:', error);
    console.error('Error message:', (error as Error)?.message);
    console.error('Error stack:', (error as Error)?.stack);
    console.error('=============================================================');
    throw error;
  }

  try {
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors: themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
  } catch (error) {
    console.error('========== ThemeProvider: Error in render ==========');
    console.error('Error:', error);
    console.error('Error message:', (error as Error)?.message);
    console.error('Error stack:', (error as Error)?.stack);
    console.error('====================================================');
    throw error;
  }
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

