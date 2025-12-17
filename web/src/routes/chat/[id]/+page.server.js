import { redirect } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, cookies }) {
	const user = await requireAuth(cookies);
	const { id } = params;
	
	// The id can be either a match ID or a chat ID
	// First, try to find a chat by match ID
	let chat = await db.chat.findFirst({
		where: {
			matchId: id,
			OR: [
				{ userId1: user.id },
				{ userId2: user.id }
			]
		},
		include: {
			match: {
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
			}
		}
	});
	
	// If not found by match ID, try by chat ID
	if (!chat) {
		chat = await db.chat.findFirst({
			where: {
				id: id,
				OR: [
					{ userId1: user.id },
					{ userId2: user.id }
				]
			},
			include: {
				match: {
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
				}
			}
		});
	}
	
	if (!chat) {
		// If chat doesn't exist, try to create it from the match
		const match = await db.match.findUnique({
			where: { id: id },
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
			throw redirect(302, '/matches');
		}
		
		// Verify user is part of this match
		if (match.userId !== user.id && match.matchedUserId !== user.id) {
			throw redirect(302, '/matches');
		}
		
		// Create chat if it doesn't exist
		const smallerId = match.userId < match.matchedUserId ? match.userId : match.matchedUserId;
		const largerId = match.userId < match.matchedUserId ? match.matchedUserId : match.userId;
		
		const newChat = await db.chat.upsert({
			where: {
				userId1_userId2: {
					userId1: smallerId,
					userId2: largerId
				}
			},
			update: {
				matchId: match.id
			},
			create: {
				matchId: match.id,
				userId1: smallerId,
				userId2: largerId
			}
		});
		
		const otherUser = match.userId === user.id ? match.matchedUser : match.user;
		
		return {
			chatId: newChat.id,
			matchId: match.id,
			otherUser
		};
	}
	
	// Get the other user
	const otherUser = chat.match.userId === user.id ? chat.match.matchedUser : chat.match.user;
	
	return {
		chatId: chat.id,
		matchId: chat.matchId,
		otherUser
	};
}

