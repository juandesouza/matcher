import { lucia } from './lucia.js';
import { redirect, json } from '@sveltejs/kit';

/**
 * Get the current session from cookies
 * @param {import('@sveltejs/kit').Cookies} cookies
 * @returns {Promise<import('lucia').Session | null>}
 */
export async function getSession(cookies) {
	const sessionId = cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		return null;
	}

	const { session } = await lucia.validateSession(sessionId);
	return session;
}

/**
 * Get the current user from session
 * @param {import('@sveltejs/kit').Cookies} cookies
 * @returns {Promise<import('lucia').User | null>}
 */
export async function getUser(cookies) {
	const sessionId = cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		return null;
	}

	const { user } = await lucia.validateSession(sessionId);
	return user;
}

/**
 * Require authentication - redirects to login if not authenticated
 * @param {import('@sveltejs/kit').Cookies} cookies
 * @param {boolean} [returnJson=false] - If true, return JSON error instead of redirect (for API routes)
 * @returns {Promise<import('lucia').User>}
 */
export async function requireAuth(cookies, returnJson = false) {
	const user = await getUser(cookies);
	if (!user) {
		if (returnJson) {
			// For API routes, return JSON error instead of redirect
			throw json({ error: 'Unauthorized' }, { status: 401 });
		}
		throw redirect(302, '/auth/login');
	}
	return user;
}

/**
 * Get session and user together
 * @param {import('@sveltejs/kit').Cookies} cookies
 * @returns {Promise<{session: import('lucia').Session | null, user: import('lucia').User | null}>}
 */
export async function getSessionAndUser(cookies) {
	const sessionId = cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		return { session: null, user: null };
	}

	const { session, user } = await lucia.validateSession(sessionId);
	return { session, user };
}


