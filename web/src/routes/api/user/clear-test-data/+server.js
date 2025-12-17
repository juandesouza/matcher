import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies }) {
	const user = await requireAuth(cookies, true);
	
	try {
		console.log('[Clear Test Data] Clearing data for user:', user.id);
		
		// Delete all matches where user is involved
		const deletedMatches = await db.match.deleteMany({
			where: {
				OR: [
					{ userId: user.id },
					{ matchedUserId: user.id }
				]
			}
		});

		console.log('[Clear Test Data] Deleted', deletedMatches.count, 'matches');

		// Delete all swipes where user is involved (both given and received)
		const deletedSwipes = await db.swipe.deleteMany({
			where: {
				OR: [
					{ userId: user.id },
					{ targetUserId: user.id }
				]
			}
		});

		console.log('[Clear Test Data] Deleted', deletedSwipes.count, 'swipes');

		// Delete all chats where user is involved
		const deletedChats = await db.chat.deleteMany({
			where: {
				OR: [
					{ userId1: user.id },
					{ userId2: user.id }
				]
			}
		});

		console.log('[Clear Test Data] Deleted', deletedChats.count, 'chats');

		// Re-setup fake users to like the real user
		const fakeUsers = await db.user.findMany({
			where: {
				email: {
					contains: 'example.com'
				},
				id: {
					not: user.id
				}
			}
		});

		let likesSetup = 0;
		for (const fakeUser of fakeUsers) {
			await db.swipe.upsert({
				where: {
					userId_targetUserId: {
						userId: fakeUser.id,
						targetUserId: user.id
					}
				},
				update: {
					action: 'LIKE'
				},
				create: {
					userId: fakeUser.id,
					targetUserId: user.id,
					action: 'LIKE'
				}
			});
			likesSetup++;
		}

		console.log('[Clear Test Data] Set up', likesSetup, 'fake users to like the real user');

		return json({
			success: true,
			message: 'Test data cleared successfully',
			deleted: {
				matches: deletedMatches.count,
				swipes: deletedSwipes.count,
				chats: deletedChats.count
			},
			setup: {
				fakeUserLikes: likesSetup
			}
		});
	} catch (error) {
		console.error('[Clear Test Data] Error:', error);
		return json({ error: 'Failed to clear test data' }, { status: 500 });
	}
}

