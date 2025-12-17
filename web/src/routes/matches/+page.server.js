import { redirect } from '@sveltejs/kit';
import { getUser } from '$lib/auth/utils.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
	const user = await getUser(cookies);
	
	// Redirect to login if not authenticated
	if (!user) {
		throw redirect(302, '/auth/login');
	}
	
	return {};
}

