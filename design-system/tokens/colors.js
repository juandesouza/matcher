/**
 * Matcher Design System - Color Tokens
 * Shared color definitions for web and React Native mobile app
 * 
 * IMPORTANT: Light theme uses soft grey (#f3f4f6) for backgrounds, not pure white
 */

export const colors = {
	// Primary Brand Colors
	crimsonPulse: {
		hex: '#C62828',
		rgb: { r: 198, g: 40, b: 40 },
		css: 'var(--color-crimson-pulse)',
		// React Native: use hex directly
		reactNative: '#C62828'
	},
	rubyEmber: {
		hex: '#D32F2F',
		rgb: { r: 211, g: 47, b: 47 },
		css: 'var(--color-ruby-ember)',
		reactNative: '#D32F2F'
	},
	
	// Accent Colors
	matchGreen: {
		hex: '#1DB954',
		rgb: { r: 29, g: 185, b: 84 },
		css: 'var(--color-match-green)',
		reactNative: '#1DB954'
	},
	dislikeGray: {
		hex: '#9E9E9E',
		rgb: { r: 158, g: 158, b: 158 },
		css: 'var(--color-dislike-gray)',
		reactNative: '#9E9E9E'
	},
	
	// Dark Theme
	dark: {
		background: {
			hex: '#121212',
			css: 'var(--color-bg-dark)',
			reactNative: '#121212'
		},
		card: {
			hex: '#1E1E1E',
			css: 'var(--color-card-dark)',
			reactNative: '#1E1E1E'
		},
		text: {
			hex: '#F8F8F8',
			css: 'var(--color-text-light)',
			reactNative: '#F8F8F8'
		},
		// Border colors for dark theme
		border: {
			hex: '#374151', // gray-700 equivalent
			reactNative: '#374151'
		},
		// Hover states
		hover: {
			hex: '#2D2D2D', // slightly lighter than card
			reactNative: '#2D2D2D'
		}
	},
	
	// Light Theme (soft grey, not pure white)
	light: {
		background: {
			hex: '#f3f4f6', // Soft grey for eye comfort
			css: 'var(--color-bg-light)',
			reactNative: '#f3f4f6'
		},
		card: {
			hex: '#FFFFFF',
			css: '#FFFFFF',
			reactNative: '#FFFFFF'
		},
		text: {
			hex: '#222222',
			css: 'var(--color-text-dark)',
			reactNative: '#222222'
		},
		// Border colors for light theme
		border: {
			hex: '#D1D5DB', // gray-300 equivalent
			reactNative: '#D1D5DB'
		},
		// Hover states
		hover: {
			hex: '#E5E7EB', // gray-200 equivalent
			reactNative: '#E5E7EB'
		},
		// Input backgrounds
		input: {
			hex: '#E5E7EB', // gray-200
			reactNative: '#E5E7EB'
		}
	},
	
	// Gray scale for borders and dividers (theme-aware)
	gray: {
		200: '#E5E7EB',
		300: '#D1D5DB',
		400: '#9CA3AF',
		500: '#6B7280',
		600: '#4B5563',
		700: '#374151',
		800: '#1F2937'
	}
};

export default colors;
