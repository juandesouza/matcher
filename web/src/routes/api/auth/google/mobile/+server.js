import { json } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { env } from '$env/dynamic/private';

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, request }) {
	const clientId = env.GOOGLE_CLIENT_ID;
	
	// Get device_id and device_name from query params (mobile app should send these)
	// For private IP OAuth, Google requires these parameters
	const deviceId = url.searchParams.get('device_id') || `device_${randomUUID()}`;
	const deviceName = url.searchParams.get('device_name') || 'Matcher Mobile App';
	
	// For mobile OAuth, we MUST use the actual server IP, not localhost
	// The mobile app connects via IP (e.g., http://192.168.100.109:5173)
	// So the redirect_uri must also use the IP, otherwise Google will redirect to localhost
	// which the mobile device can't reach
	
	// Default IP that mobile app uses (should match EXPO_PUBLIC_API_URL in mobile/.env)
	const DEFAULT_MOBILE_IP = 'http://192.168.100.109:5173';
	
	let serverOrigin = null;
	
	// 1. Check if there's an explicit redirect URI in env that uses IP (not localhost)
	if (env.GOOGLE_REDIRECT_URI) {
		try {
			const redirectUrl = new URL(env.GOOGLE_REDIRECT_URI);
			const hostname = redirectUrl.hostname;
			// Only use if it's not localhost
			if (hostname && !hostname.includes('localhost') && hostname !== '127.0.0.1') {
				serverOrigin = redirectUrl.origin;
				console.log('[Google OAuth Mobile] Using GOOGLE_REDIRECT_URI from env:', serverOrigin);
			}
		} catch (e) {
			console.warn('[Google OAuth Mobile] Invalid GOOGLE_REDIRECT_URI in env:', e);
		}
	}
	
	// 2. Try to get from request URL or headers
	if (!serverOrigin) {
		// Check the actual request URL first
		try {
			const requestUrl = new URL(request.url);
			const hostname = requestUrl.hostname;
			if (hostname && !hostname.includes('localhost') && hostname !== '127.0.0.1') {
				// For ngrok and other tunnel services, always use https
				let protocol = 'http';
				if (hostname.includes('.ngrok') || hostname.includes('.loca.lt')) {
					protocol = 'https';
				} else if (requestUrl.protocol === 'https:') {
					protocol = 'https';
				}
				serverOrigin = `${protocol}://${requestUrl.host}`;
				console.log('[Google OAuth Mobile] Using origin from request URL:', serverOrigin);
			}
		} catch (e) {
			// Continue to next check
		}
		
		// Check Host header
		if (!serverOrigin) {
			const host = request.headers.get('host');
			if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
				// For ngrok and other tunnel services, always use https
				let protocol = 'https';
				if (host.includes('.ngrok') || host.includes('.loca.lt')) {
					protocol = 'https';
				} else {
					// Check x-forwarded-proto header (set by reverse proxies like ngrok)
					const forwardedProto = request.headers.get('x-forwarded-proto');
					protocol = forwardedProto === 'https' ? 'https' : 'http';
				}
				serverOrigin = `${protocol}://${host}`;
				console.log('[Google OAuth Mobile] Using origin from Host header:', serverOrigin);
			}
		}
	}
	
	// 3. Fallback: Always use the default IP for mobile (never use localhost)
	if (!serverOrigin) {
		serverOrigin = DEFAULT_MOBILE_IP;
		console.log('[Google OAuth Mobile] Using default IP (this is expected for mobile):', serverOrigin);
	}
	
	// For mobile, use the ngrok URL as redirect URI (Google requires HTTP/HTTPS)
	// The backend callback will then redirect to the deep link
	const redirectUri = `${serverOrigin}/api/auth/google/callback`;
	const scopes = env.GOOGLE_SCOPES ?? 'openid email profile';
	
	console.log('[Google OAuth Mobile] Using ngrok URL as redirect URI:', redirectUri);
	console.log('[Google OAuth Mobile] ⚠️  IMPORTANT: Register this in Google Cloud Console!');
	console.log('[Google OAuth Mobile] ⚠️  Add to Authorized redirect URIs:', redirectUri);
	console.log('[Google OAuth Mobile] Backend will redirect to matcher://auth/callback after processing');

	if (!clientId) {
		return json(
			{ error: 'Google OAuth is not configured' },
			{ status: 501 }
		);
	}

	// Build the Google OAuth URL
	// Note: Google OAuth requires the redirect_uri to match exactly (including query params)
	// But Google actually strips query params from the redirect_uri when redirecting back
	// So we use the base redirect_uri without query params
	const authUrl = new URL(GOOGLE_AUTH_BASE);
	authUrl.searchParams.set('client_id', clientId);
	authUrl.searchParams.set('redirect_uri', redirectUri);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('scope', scopes);
	authUrl.searchParams.set('access_type', 'offline');
	authUrl.searchParams.set('prompt', 'consent');
	authUrl.searchParams.set('include_granted_scopes', 'true');
	const state = randomUUID();
	authUrl.searchParams.set('state', state);
	
	// For custom URI schemes (deep links), device_id and device_name are NOT required
	// They're only needed for private IP addresses
	console.log('[Google OAuth Mobile] Using deep link - NOT adding device_id/device_name');
	
	console.log('[Google OAuth Mobile] Full OAuth URL:', authUrl.toString());
	console.log('[Google OAuth Mobile] Client ID:', clientId);
	console.log('[Google OAuth Mobile] Redirect URI:', redirectUri);
	console.log('[Google OAuth Mobile] Scopes:', scopes);
	console.log('[Google OAuth Mobile] State:', state);
	console.log('[Google OAuth Mobile] Device ID:', deviceId);
	console.log('[Google OAuth Mobile] Device Name:', deviceName);

	// Return the URL as JSON for mobile apps
	return json({
		authUrl: authUrl.toString(),
		redirectUri: redirectUri
	});
}


