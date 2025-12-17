import { redirect } from '@sveltejs/kit';
import { getUser } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	const user = await getUser(cookies);
	
	if (!user) {
		throw redirect(302, '/auth/login');
	}
	
	// Get user data
	const userData = await db.user.findUnique({
		where: { id: user.id },
		select: {
			id: true,
			name: true,
			age: true,
			photos: true
		}
	});
	
	return {
		user: userData
	};
}

