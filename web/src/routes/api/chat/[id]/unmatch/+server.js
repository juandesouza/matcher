import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, cookies }) {
	const user = await requireAuth(cookies, true);
	const { id: chatId } = params;

	try {
		const chat = await db.chat.findFirst({
			where: {
				id: chatId,
				OR: [{ userId1: user.id }, { userId2: user.id }]
			}
		});

		if (!chat) {
			return json({ error: 'Chat not found' }, { status: 404 });
		}

		const otherUserId = chat.userId1 === user.id ? chat.userId2 : chat.userId1;

		await db.$transaction(async (tx) => {
			// Remove chat (messages are cascade-deleted by FK).
			await tx.chat.delete({
				where: { id: chat.id }
			});

			// Remove only current user's directed match record.
			await tx.match.deleteMany({
				where: {
					userId: user.id,
					matchedUserId: otherUserId
				}
			});

			// Remove like/dislike from current user so card can appear again.
			await tx.swipe.deleteMany({
				where: {
					userId: user.id,
					targetUserId: otherUserId
				}
			});
		});

		return json({ success: true });
	} catch (error) {
		console.error('Unmatch error:', error);
		return json({ error: 'Failed to unmatch user' }, { status: 500 });
	}
}

