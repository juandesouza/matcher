import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, cookies }) {
	const user = await requireAuth(cookies);
	
	const { id } = params;
	
	// Verify user has access to this chat and get chat info
	const chat = await db.chat.findFirst({
		where: {
			id: id,
			OR: [
				{ userId1: user.id },
				{ userId2: user.id }
			]
		},
		include: {
			user1: {
				select: {
					id: true,
					name: true,
					photos: true
				}
			},
			user2: {
				select: {
					id: true,
					name: true,
					photos: true
				}
			}
		}
	});
	
	if (!chat) {
		return json({ error: 'Chat not found' }, { status: 404 });
	}
	
	// Get the other user (not the current user)
	const otherUser = chat.userId1 === user.id ? chat.user2 : chat.user1;
	
	return json({
		chat: {
			id: chat.id,
			otherUser: {
				id: otherUser.id,
				name: otherUser.name,
				photos: otherUser.photos
			}
		}
	});
}

