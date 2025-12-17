import { redirect } from '@sveltejs/kit';
import { getUser } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	const user = await getUser(cookies);
	
	if (!user) {
		throw redirect(302, '/auth/login');
	}
	
	// Get user data to check if already completed
	const userData = await db.user.findUnique({
		where: { id: user.id },
		select: {
			age: true,
			gender: true,
			bio: true,
			photos: true
		}
	});
	
	// If profile is already complete, redirect to home
	if (userData?.age && userData?.gender && userData?.bio && userData?.photos?.length > 0) {
		throw redirect(302, '/');
	}
	
	return {};
}

