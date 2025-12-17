import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request, cookies }) {
	const user = await requireAuth(cookies, true);
	
	try {
		const { lat, lng } = await request.json();
		
		if (!lat || !lng) {
			return json({ error: 'Latitude and longitude are required' }, { status: 400 });
		}
		
		await db.user.update({
			where: { id: user.id },
			data: {
				location: { lat, lng }
			}
		});
		
		return json({ success: true });
	} catch (error) {
		console.error('Location update error:', error);
		return json({ error: 'Failed to update location' }, { status: 500 });
	}
}

