import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { prismaDirnamePolyfill } from './vite-plugin-prisma-dirname.js';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
	server: {
		port: 5173,
		strictPort: true, // Fail if port 5173 is not available
		host: '0.0.0.0', // Listen on all interfaces (IPv4 and IPv6)
		// Allow ngrok and other tunnel services (development only)
		allowedHosts: isProduction
			? []
			: [
					'localhost',
					'.ngrok-free.dev',
					'.ngrok.io',
					'.loca.lt',
					'noniridescently-ungroveling-charlsie.ngrok-free.dev'
				],
		hmr: {
			clientPort: 5173
		}
	},
	plugins: [
		sveltekit({
			// In production, enable CSRF protection
			// In development, disable for ngrok/tunnel support
			csrf: {
				checkOrigin: isProduction
			}
		}),
		// Inject __dirname polyfill for Prisma
		prismaDirnamePolyfill()
		// PWA plugin removed to prevent service worker from blocking OAuth callbacks
		// Can be re-enabled later if needed for production
	],
	build: {
		sourcemap: !isProduction, // Disable sourcemaps in production for security
		minify: isProduction ? 'esbuild' : false
	}
});
