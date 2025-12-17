import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ cookies }) {
	const user = await requireAuth(cookies, true); // true = return JSON error instead of redirect
	
	console.log('[Matches API] User ID:', user.id);
	console.log('[Matches API] User email:', user.email);
	
	// Fetch matches from database
	const matches = await db.match.findMany({
		where: {
			OR: [
				{ userId: user.id },
				{ matchedUserId: user.id }
			]
		},
		include: {
			user: {
				select: {
					id: true,
					name: true,
					age: true,
					photos: true
				}
			},
			matchedUser: {
				select: {
					id: true,
					name: true,
					age: true,
					photos: true
				}
			}
		},
		orderBy: {
			createdAt: 'desc'
		}
	});
	
	console.log('[Matches API] Found matches:', matches.length);
	
	// Format matches to return the other user
	const formattedMatches = matches.map(match => {
		const otherUser = match.userId === user.id ? match.matchedUser : match.user;
		return {
			id: match.id,
			user: otherUser,
			createdAt: match.createdAt.toISOString()
		};
	});
	
	return json({ matches: formattedMatches });
}

