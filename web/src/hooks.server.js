// Import polyfill first to ensure __dirname is available for Prisma
import './lib/polyfills/dirname.js';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Allow ngrok domains and localhost for development
	const host = event.request.headers.get('host');
	
	// List of allowed hosts (add your ngrok domain here)
	const allowedHosts = [
		'localhost:5173',
		'127.0.0.1:5173',
		'192.168.100.109:5173',
		// Allow any ngrok domain
		...(host && host.includes('.ngrok-free.dev') ? [host] : []),
		...(host && host.includes('.ngrok.io') ? [host] : []),
		...(host && host.includes('.loca.lt') ? [host] : []),
	];
	
	// In production, enforce strict host checking
	const isProduction = process.env.NODE_ENV === 'production';
	
	if (host && !allowedHosts.includes(host)) {
		// Allow if it's a known tunnel service (development only)
		const isTunnelService = 
			host.includes('.ngrok') ||
			host.includes('.loca.lt') ||
			host.includes('.ngrok-free.dev') ||
			host.includes('.ngrok.io');
		
		// In production, block all tunnel services and unknown hosts
		if (isProduction && (!host || isTunnelService)) {
			return new Response('Blocked request. This host is not allowed.', {
				status: 403
			});
		}
		
		// In development, allow tunnel services
		if (!isProduction && isTunnelService) {
			// Allow tunnel services in development
		} else if (!isProduction) {
			// In development, be more permissive
			console.warn(`[Dev] Unknown host: ${host}`);
		}
	}
	
	return resolve(event);
}

