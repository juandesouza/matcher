import { json } from '@sveltejs/kit';
import { lucia, createKey } from '$lib/auth/lucia.js';
import { db } from '$lib/db.js';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, cookies }) {
	const code = url.searchParams.get('code');
	const error = url.searchParams.get('error');

	if (error) {
		return json({ error }, { status: 400 });
	}

	if (!code) {
		return json({ error: 'No code parameter' }, { status: 400 });
	}

	const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
	const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
	// For Expo AuthSession, the redirect URI is the Expo proxy URL
	// The app should send it as a query parameter
	// Format: https://auth.expo.dev/@username/matcher
	const redirectUri = url.searchParams.get('redirect_uri');
	
	if (!redirectUri) {
		return json({ error: 'redirect_uri parameter required' }, { status: 400 });
	}
	
	console.log('[OAuth Callback] Using redirect URI:', redirectUri);

	if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
		return json({ error: 'Google OAuth not configured' }, { status: 500 });
	}

	try {
		// Exchange code for tokens
		const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				code: code.trim(),
				client_id: GOOGLE_CLIENT_ID,
				client_secret: GOOGLE_CLIENT_SECRET,
				redirect_uri: redirectUri,
				grant_type: 'authorization_code'
			})
		});

		if (!tokenResponse.ok) {
			const errorData = await tokenResponse.json();
			return json({ error: errorData.error_description || errorData.error || 'Token exchange failed' }, { status: 400 });
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
			return json({ error: 'Failed to fetch user info' }, { status: 400 });
		}

		const googleUser = await userInfoResponse.json();

		// Find or create user
		let user = await db.user.findUnique({
			where: { email: googleUser.email.toLowerCase() }
		});

		if (!user) {
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
			await createKey(user.id, 'google', googleUser.id);
		} else {
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
			
			const existingKey = await db.key.findFirst({
				where: {
					userId: user.id,
					providerId: 'google',
					providerUserId: googleUser.id
				}
			});
			
			if (!existingKey) {
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

		return json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
	} catch (error) {
		console.error('OAuth callback error:', error);
		return json({ error: error.message || 'OAuth processing failed' }, { status: 500 });
	}
}

