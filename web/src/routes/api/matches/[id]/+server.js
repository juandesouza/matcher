import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, cookies }) {
	const user = await requireAuth(cookies);
	
	const { id } = params;
	
	// Fetch match from database
	const match = await db.match.findFirst({
		where: {
			id: id,
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
		}
	});
	
	if (!match) {
		return json({ error: 'Match not found' }, { status: 404 });
	}
	
	// Return the other user (not the current user)
	const otherUser = match.userId === user.id ? match.matchedUser : match.user;
	
	return json({
		id: match.id,
		user: otherUser,
		createdAt: match.createdAt.toISOString()
	});
}

