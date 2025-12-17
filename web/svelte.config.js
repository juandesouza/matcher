import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],
	kit: {
		adapter: adapter({
			out: 'build',
			precompress: true, // Enable gzip compression
			envPrefix: ['VITE_', 'PUBLIC_'] // Environment variable prefixes
		}),
		// Security headers
		csp: {
			directives: {
				'script-src': ["'self'", "'unsafe-inline'", 'https://js.stripe.com'],
				'frame-src': ['https://js.stripe.com', 'https://hooks.stripe.com'],
				'img-src': ["'self'", 'data:', 'https:', 'http:'],
				'connect-src': ["'self'", 'https://api.stripe.com', 'https://hooks.stripe.com']
			}
		}
	}
};

export default config;
