import { json } from '@sveltejs/kit';
import { getUser } from '$lib/auth/utils.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies }) {
	const user = await getUser(cookies);
	
	if (!user) {
		return json({ authenticated: false }, { status: 401 });
	}
	
	return json({
		authenticated: true,
		user: {
			id: user.id,
			email: user.email,
			name: user.name
		}
	});
}
