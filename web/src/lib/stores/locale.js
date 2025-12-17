import { locale, isLoading } from 'svelte-i18n';
import { browser } from '$app/environment';
import { supportedLocales, defaultLocale } from '../i18n/index.js';

const createLocaleStore = () => {
	return {
		set: (newLocale) => {
			if (browser && supportedLocales.includes(newLocale)) {
				locale.set(newLocale);
				localStorage.setItem('matcher-locale', newLocale);
			}
		},
		get: () => {
			if (browser) {
				return localStorage.getItem('matcher-locale') || defaultLocale;
			}
			return defaultLocale;
		},
		supportedLocales,
		defaultLocale
	};
};

export const localeStore = createLocaleStore();

