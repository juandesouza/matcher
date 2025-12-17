import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, cookies }) {
	const user = await requireAuth(cookies);
	
	const { id } = params;
	const targetUserId = id;
	
	// Check if there's a mutual match
	const match = await db.match.findFirst({
		where: {
			OR: [
				{
					userId: user.id,
					matchedUserId: targetUserId
				},
				{
					userId: targetUserId,
					matchedUserId: user.id
				}
			]
		},
		include: {
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
	
	if (match) {
		return json({
			isMatch: true,
			matchId: match.id,
			user: match.matchedUser
		});
	}
	
	return json({ isMatch: false });
}

