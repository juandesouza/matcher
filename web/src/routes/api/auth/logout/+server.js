import { json } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia.js';
import { getSession } from '$lib/auth/utils.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies }) {
	const session = await getSession(cookies);
	
	if (session) {
		await lucia.invalidateSession(session.id);
	}
	
	const sessionCookie = lucia.createBlankSessionCookie();
	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
	
	return json({ success: true });
}
