import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const createThemeStore = () => {
	const { subscribe, set, update } = writable('dark');
	
	const applyTheme = (theme) => {
		if (browser) {
			const html = document.documentElement;
			// Set data-theme attribute for CSS variables
			html.setAttribute('data-theme', theme);
			// Add/remove dark class for Tailwind dark mode
			if (theme === 'dark') {
				html.classList.add('dark');
			} else {
				html.classList.remove('dark');
			}
			localStorage.setItem('matcher-theme', theme);
		}
	};
	
	return {
		subscribe,
		set: (theme) => {
			applyTheme(theme);
			set(theme);
		},
		toggle: () => {
			update((current) => {
				const newTheme = current === 'dark' ? 'light' : 'dark';
				applyTheme(newTheme);
				return newTheme;
			});
		},
		init: () => {
			if (browser) {
				const saved = localStorage.getItem('matcher-theme') || 'dark';
				applyTheme(saved);
				set(saved);
			}
		}
	};
};

export const theme = createThemeStore();

