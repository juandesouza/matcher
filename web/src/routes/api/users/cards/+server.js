import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
	const R = 6371; // Earth's radius in km
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a = 
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	return R * c;
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies }) {
	try {
		const user = await requireAuth(cookies);
		console.log('[API Cards] User authenticated:', user.id);
		
		// Fetch user preferences and location
		const userData = await db.user.findUnique({
			where: { id: user.id },
			select: {
				ageRange: true,
				distanceRange: true,
				location: true,
				age: true,
				gender: true
			}
		});
		
		console.log('[API Cards] User data:', {
			hasLocation: !!userData?.location,
			hasGender: !!userData?.gender,
			gender: userData?.gender,
			ageRange: userData?.ageRange,
			distanceRange: userData?.distanceRange
		});
		
		if (!userData || !userData.location || !userData.gender) {
			console.warn('[API Cards] User missing required data (location or gender), returning empty cards');
			return json({ cards: [] });
		}
	
	// Determine opposite gender
	const oppositeGender = userData.gender === 'male' ? 'female' : 'male';
	
	// Get users that haven't been swiped on yet
	const swipedUserIds = await db.swipe.findMany({
		where: { userId: user.id },
		select: { targetUserId: true }
	}).then(swipes => swipes.map(s => s.targetUserId));
	
		// Get all users except current user and already swiped users
		// Filter by opposite gender
		const allUsers = await db.user.findMany({
			where: {
				id: { not: user.id },
				gender: oppositeGender,
				age: { not: null },
				bio: { not: null },
				photos: { isEmpty: false },
				location: { not: null }
			},
			select: {
				id: true,
				name: true,
				age: true,
				bio: true,
				photos: true,
				location: true
			}
		});
		
		console.log('[API Cards] Found', allUsers.length, 'users with opposite gender and complete profiles');
		console.log('[API Cards] Already swiped on', swipedUserIds.length, 'users');
	
	// Filter by age range and distance
	const userLocation = userData.location;
	const ageRange = userData.ageRange || { min: 18, max: 99 };
	const distanceRange = userData.distanceRange || 50;
	
	console.log('[API Cards] User location:', userLocation);
	console.log('[API Cards] Age range:', ageRange);
	console.log('[API Cards] Distance range:', distanceRange, 'km');
	
	// Filters are preferences, not restrictions
	// First, try to get cards matching preferences (age + distance)
	let preferredCards = allUsers
		.filter(u => {
			// Filter out already swiped users
			if (swipedUserIds.includes(u.id)) return false;
			
			// Filter by age preference
			if (u.age < ageRange.min || u.age > ageRange.max) {
				return false;
			}
			
			// Filter by distance preference
			if (u.location && userLocation) {
				const distance = calculateDistance(
					userLocation.lat,
					userLocation.lng,
					u.location.lat,
					u.location.lng
				);
				if (distance > distanceRange) {
					return false;
				}
			}
			
			return true;
		})
		.map(u => ({
			id: u.id,
			name: u.name,
			age: u.age,
			photos: u.photos,
			bio: u.bio
		}));
	
	console.log('[API Cards] Cards matching preferences (age + distance):', preferredCards.length);
	
	// If no cards match preferences, show all available cards (ignoring filters)
	let filteredCards = preferredCards;
	if (filteredCards.length === 0) {
		console.log('[API Cards] No cards match preferences, showing all available cards (ignoring age and distance filters)');
		filteredCards = allUsers
			.filter(u => {
				// Only filter out already swiped users
				if (swipedUserIds.includes(u.id)) return false;
				return true;
			})
			.map(u => ({
				id: u.id,
				name: u.name,
				age: u.age,
				photos: u.photos,
				bio: u.bio
			}));
		console.log('[API Cards] Cards after ignoring filters:', filteredCards.length);
	}
	
		console.log('[API Cards] Final result: Returning', filteredCards.length, 'filtered cards');
		
		// If still no cards, log detailed info for debugging
		if (filteredCards.length === 0) {
			console.warn('[API Cards] No cards to return. Debug info:');
			console.warn('  - User ID:', user.id);
			console.warn('  - User gender:', userData.gender);
			console.warn('  - Looking for:', oppositeGender);
			console.warn('  - All users with opposite gender:', allUsers.length);
			console.warn('  - Already swiped:', swipedUserIds.length);
			console.warn('  - Age range:', ageRange);
			console.warn('  - Distance range:', distanceRange, 'km');
		}
		
		return json({ cards: filteredCards });
	} catch (error) {
		console.error('[API Cards] Error:', error);
		return json({ cards: [], error: error.message }, { status: 500 });
	}
}

