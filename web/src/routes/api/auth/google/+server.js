import { json, redirect } from '@sveltejs/kit';
import { randomUUID } from 'crypto';
import { env } from '$env/dynamic/private';

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const clientId = env.GOOGLE_CLIENT_ID;
	const redirectUri =
		env.GOOGLE_REDIRECT_URI ?? `${url.origin}/api/auth/google/callback`;
	const scopes = env.GOOGLE_SCOPES ?? 'openid email profile';

	// Debug: Log environment variable status (remove in production)
	console.log('[Google OAuth Debug] Client ID:', clientId ? 'SET' : 'NOT SET');
	console.log('[Google OAuth Debug] All env keys:', Object.keys(env).filter(k => k.includes('GOOGLE')));
	console.log('[Google OAuth Debug] Redirect URI:', redirectUri);

	if (!clientId) {
		const message = `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<title>Google Login Not Configured</title>
					<style>
						body { font-family: system-ui, sans-serif; background: #111; color: #f3f3f3; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
						.wrapper { max-width: 520px; padding: 2rem; background: #1f1f1f; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); }
						h1 { margin-top: 0; color: #f87171; }
						code { background: #2d2d2d; padding: 0.2rem 0.4rem; border-radius: 4px; }
						a { color: #60a5fa; }
					</style>
				</head>
				<body>
					<div class="wrapper">
						<h1>Google OAuth is not configured</h1>
						<p>
							Set the following environment variables on your server (and restart) to enable Google login:
						</p>
						<ul>
							<li><code>GOOGLE_CLIENT_ID</code></li>
							<li><code>GOOGLE_REDIRECT_URI</code> (optional, defaults to <code>${url.origin}/api/auth/google/callback</code>)</li>
							<li><code>GOOGLE_SCOPES</code> (optional)</li>
						</ul>
						<p>
							Once those are in place, the Google button will redirect to the real OAuth consent screen.
							<a href="/">Back to app</a>
						</p>
					</div>
				</body>
			</html>
		`.replace(/\s{2,}/g, ' ');

		return new Response(message, {
		status: 501,
		headers: { 'content-type': 'text/html; charset=utf-8' }
	});
	}

	const authUrl = new URL(GOOGLE_AUTH_BASE);
	authUrl.searchParams.set('client_id', clientId);
	authUrl.searchParams.set('redirect_uri', redirectUri);
	authUrl.searchParams.set('response_type', 'code');
	authUrl.searchParams.set('scope', scopes);
	authUrl.searchParams.set('access_type', 'offline');
	authUrl.searchParams.set('prompt', 'consent');
	authUrl.searchParams.set('include_granted_scopes', 'true');
	authUrl.searchParams.set('state', randomUUID());

	throw redirect(302, authUrl.toString());
}

