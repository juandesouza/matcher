import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		// Simple security: Check for a secret token in the request
		// In production, use a proper API key or admin authentication
		const { secret } = await request.json();
		
		// Use a secret from environment variable or a hardcoded one for this operation
		const expectedSecret = process.env.CLEANUP_SECRET || 'cleanup-test-users-secret';
		
		if (secret !== expectedSecret) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		console.log('[Cleanup] Starting cleanup of test users older than 24 hours...');
		
		// Find test users created more than 24 hours ago
		const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
		
		const testUsers = await db.user.findMany({
			where: {
				email: {
					startsWith: 'test_'
				},
				createdAt: {
					lt: twentyFourHoursAgo
				}
			},
			include: {
				matches: true,
				matchUsers: true,
				chats: true,
				chatUsers: true,
				messages: true,
				swipes: true,
				receivedSwipes: true
			}
		});

		console.log(`[Cleanup] Found ${testUsers.length} test users to delete`);

		let deletedCount = 0;
		let deletedMatches = 0;
		let deletedChats = 0;
		let deletedMessages = 0;

		for (const testUser of testUsers) {
			// Delete associated data (cascades should handle most, but let's be explicit)
			
			// Delete messages
			await db.message.deleteMany({
				where: {
					userId: testUser.id
				}
			});

			// Delete swipes
			await db.swipe.deleteMany({
				where: {
					OR: [
						{ userId: testUser.id },
						{ targetUserId: testUser.id }
					]
				}
			});

			// Delete matches (cascades will delete chats)
			await db.match.deleteMany({
				where: {
					OR: [
						{ userId: testUser.id },
						{ matchedUserId: testUser.id }
					]
				}
			});

			// Delete keys
			await db.key.deleteMany({
				where: {
					userId: testUser.id
				}
			});

			// Delete sessions (using raw query since Session table uses snake_case)
			await db.$executeRaw`
				DELETE FROM session WHERE user_id = ${testUser.id}
			`;

			// Finally delete the user
			await db.user.delete({
				where: {
					id: testUser.id
				}
			});

			deletedCount++;
		}

		console.log(`[Cleanup] Deleted ${deletedCount} test users`);

		return json({
			success: true,
			deletedUsers: deletedCount,
			deletedMatches,
			deletedChats,
			deletedMessages
		});

	} catch (error) {
		console.error('[Cleanup] Error:', error);
		return json({ 
			error: 'Cleanup failed', 
			message: error.message
		}, { status: 500 });
	}
}

