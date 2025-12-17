import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies }) {
	const user = await requireAuth(cookies, true); // true = return JSON error instead of redirect
	
	// Fetch user settings from database
	const userData = await db.user.findUnique({
		where: { id: user.id },
		select: {
			ageRange: true,
			distanceRange: true,
			isSubscribed: true,
			theme: true
		}
	});
	
	return json({
		ageRange: userData?.ageRange || { min: 18, max: 99 },
		distanceRange: userData?.distanceRange || 50,
		isSubscribed: userData?.isSubscribed || false,
		theme: userData?.theme || 'dark',
		locale: 'en' // Locale support can be added later if needed
	});
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request, cookies }) {
	const user = await requireAuth(cookies, true); // true = return JSON error instead of redirect
	
	const { ageRange, distanceRange, theme, locale } = await request.json();
	
	// Update user settings in database
	await db.user.update({
		where: { id: user.id },
		data: {
			...(ageRange && { ageRange }),
			...(distanceRange !== undefined && { distanceRange }),
			...(theme && { theme })
			// Locale support can be added later if needed
		}
	});
	
	return json({ success: true });
}

