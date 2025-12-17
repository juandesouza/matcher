import { register, init, getLocaleFromNavigator, waitLocale, addMessages } from 'svelte-i18n';
import en from './locales/en.json';

const supportedLocales = ['en', 'pt', 'es', 'fr', 'it'];
const defaultLocale = 'en';

// Preload default (English) synchronously to support SSR
addMessages('en', en);

// Register locales (others can be lazy-loaded)
register('en', () => Promise.resolve(en));
register('pt', () => import('./locales/pt.json'));
register('es', () => import('./locales/es.json'));
register('fr', () => import('./locales/fr.json'));
register('it', () => import('./locales/it.json'));

// Get initial locale from browser or localStorage
function getInitialLocale() {
	if (typeof window === 'undefined') return defaultLocale;
	
	// Check localStorage first
	const savedLocale = localStorage.getItem('matcher-locale');
	if (savedLocale && supportedLocales.includes(savedLocale)) {
		return savedLocale;
	}
	
	// Get from browser
	const browserLocale = getLocaleFromNavigator();
	if (browserLocale) {
		// Extract language code (e.g., 'en-US' -> 'en')
		const langCode = browserLocale.split('-')[0].toLowerCase();
		if (supportedLocales.includes(langCode)) {
			return langCode;
		}
	}
	
	return defaultLocale;
}

// Initialize i18n
const initialLocale = getInitialLocale();

init({
	fallbackLocale: defaultLocale,
	initialLocale: initialLocale
});

// Wait for locale to load
waitLocale(initialLocale).catch(() => {
	// If initial locale fails, wait for fallback
	return waitLocale(defaultLocale);
});

export { supportedLocales, defaultLocale };

