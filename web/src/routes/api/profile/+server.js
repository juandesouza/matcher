import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies }) {
	const user = await requireAuth(cookies, true);
	
	try {
		const userData = await db.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				email: true,
				name: true,
				age: true,
				gender: true,
				bio: true,
				photos: true,
				location: true,
				ageRange: true,
				distanceRange: true,
				theme: true,
				isSubscribed: true
			}
		});
		
		return json(userData);
	} catch (error) {
		console.error('Profile fetch error:', error);
		return json({ error: 'Failed to fetch profile' }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request, cookies }) {
	const user = await requireAuth(cookies, true);
	
	try {
		const { name, age, photos } = await request.json();
		
		if (!name || name.trim().length === 0) {
			return json({ error: 'Name is required' }, { status: 400 });
		}
		
		if (!age || age < 18 || age > 99) {
			return json({ error: 'Age must be between 18 and 99' }, { status: 400 });
		}
		
		if (!photos || photos.length === 0) {
			return json({ error: 'At least one profile picture is required' }, { status: 400 });
		}
		
		// Update user profile
		await db.user.update({
			where: { id: user.id },
			data: {
				name: name.trim(),
				age,
				photos
			}
		});
		
		return json({ success: true });
	} catch (error) {
		console.error('Profile update error:', error);
		return json({ error: 'Failed to update profile' }, { status: 500 });
	}
}

