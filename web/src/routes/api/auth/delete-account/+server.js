import { json } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia.js';
import { getSession, requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies }) {
	const user = await requireAuth(cookies, true);
	const session = await getSession(cookies);

	try {
		await db.user.delete({
			where: { id: user.id }
		});

		if (session) {
			await lucia.invalidateSession(session.id);
		}

		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return json({ success: true });
	} catch (error) {
		console.error('Delete account error:', error);
		return json({ error: 'Failed to delete account' }, { status: 500 });
	}
}
