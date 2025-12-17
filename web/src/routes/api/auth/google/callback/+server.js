import { redirect } from '@sveltejs/kit';
import { lucia, createKey } from '$lib/auth/lucia.js';
import { db } from '$lib/db.js';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
	// Log immediately to help debug
	console.log('[Google OAuth Callback] Received callback request at:', new Date().toISOString());
	console.log('[Google OAuth Callback] Full URL:', url.toString());
	
	// Get the code - URLSearchParams.get() automatically decodes URL-encoded values
	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');
	const state = url.searchParams.get('state');
	
	console.log('[Google OAuth Callback] Search params:', {
		hasCode: !!code,
		codeLength: code?.length,
		hasError: !!error,
		hasState: !!state
	});

	if (error) {
		console.error('Google OAuth error:', error);
		// Check if this is a mobile request (from ngrok)
		// Redirect to deep link with error
		const deepLinkUrl = `matcher://auth/callback?error=${encodeURIComponent(error)}`;
		return new Response(null, {
			status: 302,
			headers: { 'Location': deepLinkUrl }
		});
	}

	if (!code) {
		console.error('Google OAuth callback: No code parameter');
		// Redirect to deep link with error
		const deepLinkUrl = 'matcher://auth/callback?error=no_code';
		return new Response(null, {
			status: 302,
			headers: { 'Location': deepLinkUrl }
		});
	}

	console.log('[Google OAuth Callback] Code received, exchanging for token...');

	const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
	const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
	// CRITICAL: The redirect_uri MUST match exactly what was used in the authorization request
	// For mobile, the redirect_uri might include ?mobile=true, so we need to strip that for the token exchange
	// but keep the base URL
	const baseRedirectUri = env.GOOGLE_REDIRECT_URI ?? `${url.origin}/api/auth/google/callback`;
	// Remove query params from redirect_uri for token exchange (Google doesn't include them in the actual redirect)
	const GOOGLE_REDIRECT_URI = baseRedirectUri.split('?')[0];

	console.log('[Google OAuth Callback] Config check:', {
		hasClientId: !!GOOGLE_CLIENT_ID,
		hasClientSecret: !!GOOGLE_CLIENT_SECRET,
		redirectUri: GOOGLE_REDIRECT_URI,
		urlOrigin: url.origin,
		envRedirectUri: env.GOOGLE_REDIRECT_URI
	});

	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
		console.error('Google OAuth credentials not configured');
		throw redirect(302, '/auth/login?error=not_configured');
	}

	try {
		// Exchange authorization code for tokens
		// Note: Authorization codes are single-use and expire quickly (usually within 1 minute)
		console.log('[Google OAuth Callback] Exchanging code for token...');
		console.log('[Google OAuth Callback] Code (first 30 chars):', code.substring(0, 30));
		console.log('[Google OAuth Callback] Code length:', code.length);
		console.log('[Google OAuth Callback] Redirect URI being sent to Google:', GOOGLE_REDIRECT_URI);
		
		// Build the token request body - ensure code is not double-encoded
		// The code from URL params is already decoded by URLSearchParams.get()
		const tokenRequestBody = new URLSearchParams({
			code: code.trim(), // Trim any whitespace, ensure it's the raw code
			client_id: GOOGLE_CLIENT_ID,
			client_secret: GOOGLE_CLIENT_SECRET,
			redirect_uri: GOOGLE_REDIRECT_URI, // MUST match exactly what was sent in authorization request
			grant_type: 'authorization_code'
		});
		
		console.log('[Google OAuth Callback] Token request body (without secret):', {
			code_preview: code.substring(0, 30) + '...',
			code_length: code.length,
			client_id: GOOGLE_CLIENT_ID,
			redirect_uri: GOOGLE_REDIRECT_URI,
			grant_type: 'authorization_code',
			redirect_uri_match: GOOGLE_REDIRECT_URI === 'http://localhost:5173/api/auth/google/callback'
		});
		
		// Add timeout to prevent hanging
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
		
		const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: tokenRequestBody,
			signal: controller.signal
		}).finally(() => clearTimeout(timeoutId));

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			let errorData;
			try {
				errorData = JSON.parse(errorText);
			} catch {
				errorData = { error: errorText };
			}
			console.error('Token exchange failed:', errorData);
			console.error('Response status:', tokenResponse.status);
			console.error('Response headers:', Object.fromEntries(tokenResponse.headers.entries()));
			
			// Return HTML with redirect - more reliable for OAuth callbacks
			// The "Malformed auth code" error usually means the code was already used or expired
			const errorMsg = errorData.error_description || errorData.error || 'Unknown error';
			return new Response(
				`<!DOCTYPE html>
				<html>
				<head>
					<meta http-equiv="refresh" content="0;url=/auth/login?error=token_exchange_failed&details=${encodeURIComponent(errorMsg)}">
					<script>window.location.href='/auth/login?error=token_exchange_failed&details=${encodeURIComponent(errorMsg)}';</script>
				</head>
				<body>
					<p>Redirecting...</p>
					<p><a href="/auth/login?error=token_exchange_failed&details=${encodeURIComponent(errorMsg)}">Click here if not redirected</a></p>
				</body>
				</html>`,
				{
					status: 200,
					headers: { 'Content-Type': 'text/html; charset=utf-8' }
				}
			);
		}

		const tokens = await tokenResponse.json();
		const accessToken = tokens.access_token;

		// Get user info from Google
		const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (!userInfoResponse.ok) {
			console.error('Failed to fetch user info from Google');
			throw redirect(302, '/auth/login?error=user_info_failed');
		}

		const googleUser = await userInfoResponse.json();

		// Find or create user
		let user = await db.user.findUnique({
			where: { email: googleUser.email.toLowerCase() }
		});

		if (!user) {
			// Create new user
			user = await db.user.create({
				data: {
					email: googleUser.email.toLowerCase(),
					name: googleUser.name || googleUser.given_name || 'User',
					provider: 'google',
					providerId: googleUser.id,
					photos: googleUser.picture ? [googleUser.picture] : [],
					ageRange: { min: 18, max: 99 },
					distanceRange: 50,
					theme: 'dark',
					isSubscribed: false
				}
			});

			// Create key for Lucia Auth (OAuth users don't have passwords)
			await createKey(user.id, 'google', googleUser.id);
		} else {
			// Update existing user if needed
			if (user.provider !== 'google' || user.providerId !== googleUser.id) {
				user = await db.user.update({
					where: { id: user.id },
					data: {
						provider: 'google',
						providerId: googleUser.id,
						name: googleUser.name || user.name
					}
				});
			}
			
			// Check if user has a Google key - if not, create one
			const existingKey = await db.key.findFirst({
				where: {
					userId: user.id,
					providerId: 'google',
					providerUserId: googleUser.id
				}
			});
			
			if (!existingKey) {
				console.log('[Google OAuth Callback] Creating missing Google key for existing user');
				await createKey(user.id, 'google', googleUser.id);
			}
		}

		// Create session
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		// For mobile OAuth, redirect to deep link with the OAuth code
		// This allows the app to receive the code via deep link and process it
		const deepLinkUrl = `matcher://auth/callback?code=${encodeURIComponent(code)}`;
		
		// Use HTTP 302 redirect - the app's Linking API will catch this
		return new Response(null, {
			status: 302,
			headers: {
				'Location': deepLinkUrl
			}
		});
	} catch (error) {
		console.error('Google OAuth callback error:', error);
		console.error('Error stack:', error.stack);
		console.error('Error details:', {
			message: error.message,
			name: error.name,
			status: error.status
		});
		
		// Re-throw redirects - these are intentional
		if (error.status === 302 || error.statusCode === 302) {
			throw error;
		}
		
		// Always return HTML with redirect on error - more reliable than SvelteKit redirect for OAuth
		const errorMsg = error.message || 'Unknown error';
		return new Response(
			`<!DOCTYPE html>
			<html>
			<head>
				<meta http-equiv="refresh" content="0;url=/auth/login?error=callback_failed&message=${encodeURIComponent(errorMsg)}">
				<script>window.location.href='/auth/login?error=callback_failed&message=${encodeURIComponent(errorMsg)}';</script>
			</head>
			<body>
				<p>Redirecting...</p>
				<p><a href="/auth/login?error=callback_failed&message=${encodeURIComponent(errorMsg)}">Click here if not redirected</a></p>
			</body>
			</html>`,
			{
				status: 200,
				headers: { 'Content-Type': 'text/html; charset=utf-8' }
			}
		);
	}
}

