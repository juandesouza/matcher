import { getSessionAndUser } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
	try {
		const { session, user } = await getSessionAndUser(cookies);
		
		if (!user) {
			return { session: null, user: null };
		}
		
		// Get full user data from database
		// Lucia user object has 'id' property (not 'userId')
		const userId = user.id;
		if (!userId) {
			return { session: null, user: null };
		}
		
		const userData = await db.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				name: true,
				age: true,
				gender: true,
				bio: true,
				photos: true,
				location: true,
				isSubscribed: true
			}
		});
		
		return {
			session,
			user: userData
		};
	} catch (error) {
		// Log error for debugging
		console.error('Layout server load error:', error);
		console.error('Error details:', {
			message: error.message,
			name: error.name,
			code: error.code
		});
		
		// Return null user on error - allows page to load even if DB is unavailable
		// This prevents 500 errors from blocking the entire app
		return { session: null, user: null };
	}
}

