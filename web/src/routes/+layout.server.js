import { getSessionAndUser } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
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
}

