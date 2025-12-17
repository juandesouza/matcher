import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	const user = await requireAuth(cookies, true);
	
	try {
		const { age, gender, bio, photos, location } = await request.json();
		
		// Build update data object with only provided fields
		// This endpoint can be used for both initial setup and profile updates
		const updateData = {};
		
		// Age and gender are required for initial setup, optional for updates
		if (age !== undefined) {
			if (!age || age < 18 || age > 99) {
				return json({ error: 'Age must be between 18 and 99' }, { status: 400 });
			}
			updateData.age = age;
		}
		
		if (gender !== undefined) {
			if (!gender || (gender !== 'male' && gender !== 'female')) {
				return json({ error: 'Gender must be male or female' }, { status: 400 });
			}
			updateData.gender = gender;
		}
		
		// Bio is optional, but if provided, must be 50 characters or less
		if (bio !== undefined && bio !== null) {
			if (bio.length > 50) {
				return json({ error: 'Bio must be 50 characters or less' }, { status: 400 });
			}
			updateData.bio = bio.trim() || null;
		}
		
		// Photos are optional
		if (photos !== undefined) {
			if (Array.isArray(photos) && photos.length > 0) {
				updateData.photos = photos;
			} else if (photos === null || (Array.isArray(photos) && photos.length === 0)) {
				// Allow clearing photos
				updateData.photos = [];
			}
		}
		
		// Location is optional
		if (location && location.lat && location.lng) {
			updateData.location = location;
		}
		
		// If no fields to update, return error
		if (Object.keys(updateData).length === 0) {
			return json({ error: 'No fields to update' }, { status: 400 });
		}
		
		// Update user profile
		await db.user.update({
			where: { id: user.id },
			data: updateData
		});
		
		return json({ success: true });
	} catch (error) {
		console.error('Setup error:', error);
		return json({ error: 'Failed to update profile' }, { status: 500 });
	}
}

