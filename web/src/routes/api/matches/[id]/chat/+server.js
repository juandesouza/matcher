import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, cookies }) {
	const user = await requireAuth(cookies, true);
	
	const { id: matchId } = params;
	
	// Verify user has access to this match
	const match = await db.match.findFirst({
		where: {
			id: matchId,
			OR: [
				{ userId: user.id },
				{ matchedUserId: user.id }
			]
		}
	});
	
	if (!match) {
		return json({ error: 'Match not found' }, { status: 404 });
	}
	
	// Get the other user's ID
	const otherUserId = match.userId === user.id ? match.matchedUserId : match.userId;
	
	// Find chat for this match
	const smallerId = user.id < otherUserId ? user.id : otherUserId;
	const largerId = user.id < otherUserId ? otherUserId : user.id;
	
	const chat = await db.chat.findFirst({
		where: {
			matchId: matchId,
			OR: [
				{
					userId1: smallerId,
					userId2: largerId
				}
			]
		}
	});
	
	if (!chat) {
		return json({ error: 'Chat not found for this match' }, { status: 404 });
	}
	
	return json({ chatId: chat.id });
}

