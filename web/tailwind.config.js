import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

export default {
	darkMode: 'class',
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// Matcher Brand Colors
				'crimson-pulse': '#C62828',
				'ruby-ember': '#D32F32',
				'match-green': '#1DB954',
				'dislike-gray': '#9E9E9E',
				// Theme colors using CSS variables
				'bg-dark': 'var(--color-bg-dark)',
				'bg-light': 'var(--color-bg-light)',
				'card-dark': 'var(--color-card-dark)',
				'text-light': 'var(--color-text-light)',
				'text-dark': 'var(--color-text-dark)',
				// Dynamic theme colors
				'bg': 'var(--color-bg)',
				'card': 'var(--color-card)',
				'text': 'var(--color-text)'
			},
			fontFamily: {
				sans: ['Inter', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
			},
			spacing: {
				'8': '8px',
				'16': '16px',
				'24': '24px',
				'32': '32px',
				'48': '48px'
			},
			borderRadius: {
				card: '16px'
			},
			animation: {
				swipe: 'swipe 300ms ease-out',
				'fade-in': 'fadeIn 200ms ease-in',
				'slide-up': 'slideUp 250ms ease-out'
			},
			keyframes: {
				swipe: {
					'0%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translateX(100vw) rotate(15deg)', opacity: '0' }
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				slideUp: {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			}
		}
	},
	plugins: [forms, typography]
} satisfies Config;

