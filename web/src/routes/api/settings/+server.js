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

	try {
		const { ageRange, distanceRange, theme, locale } = await request.json();
		const updateData = {};

		if (ageRange && typeof ageRange === 'object') {
			const min = Number(ageRange.min);
			const max = Number(ageRange.max);
			if (!Number.isFinite(min) || !Number.isFinite(max) || min < 18 || max > 99 || min > max) {
				return json({ error: 'Invalid age range' }, { status: 400 });
			}
			updateData.ageRange = { min, max };
		}

		if (distanceRange !== undefined) {
			const parsedDistance = Number(distanceRange);
			if (!Number.isFinite(parsedDistance) || parsedDistance < 1 || parsedDistance > 100) {
				return json({ error: 'Invalid distance range' }, { status: 400 });
			}
			updateData.distanceRange = parsedDistance;
		}

		if (theme && (theme === 'dark' || theme === 'light')) {
			updateData.theme = theme;
		}

		// Locale support can be added later if needed (kept for compatibility)
		void locale;

		if (Object.keys(updateData).length === 0) {
			return json({ error: 'No valid settings to update' }, { status: 400 });
		}

		await db.user.update({
			where: { id: user.id },
			data: updateData
		});

		return json({ success: true });
	} catch (error) {
		console.error('Settings update error:', error);
		return json({ error: 'Failed to update settings' }, { status: 500 });
	}
}

