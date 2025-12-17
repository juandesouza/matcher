import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	const user = await requireAuth(cookies, true);
	
	try {
		const { targetUserId, action } = await request.json();
		
		if (!targetUserId || !action) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}
		
		// Save swipe to database
		await db.swipe.upsert({
			where: {
				userId_targetUserId: {
					userId: user.id,
					targetUserId
				}
			},
			update: {
				action: action === 'like' ? 'LIKE' : 'DISLIKE'
			},
			create: {
				userId: user.id,
				targetUserId,
				action: action === 'like' ? 'LIKE' : 'DISLIKE'
			}
		});
		
		// Check for mutual match if it's a like
		if (action === 'like') {
			console.log('[Swipe API] Checking for mutual like:', { userId: user.id, targetUserId });
			const mutualSwipe = await db.swipe.findUnique({
				where: {
					userId_targetUserId: {
						userId: targetUserId,
						targetUserId: user.id
					}
				}
			});
			
			console.log('[Swipe API] Mutual swipe found:', mutualSwipe ? { action: mutualSwipe.action } : 'none');
			
			if (mutualSwipe && mutualSwipe.action === 'LIKE') {
				console.log('[Swipe API] Creating match!');
				// Create match
				const match = await db.match.upsert({
					where: {
						userId_matchedUserId: {
							userId: user.id,
							matchedUserId: targetUserId
						}
					},
					update: {},
					create: {
						userId: user.id,
						matchedUserId: targetUserId
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
				
				// Create chat for the match
				const smallerId = user.id < targetUserId ? user.id : targetUserId;
				const largerId = user.id < targetUserId ? targetUserId : user.id;
				
				const chatRecord = await db.chat.upsert({
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
				
				// If the matched user is a fake user, send them a message
				const matchedUserRecord = await db.user.findUnique({
					where: { id: targetUserId }
				});
				
				if (matchedUserRecord && matchedUserRecord.email?.includes('example.com')) {
					// Fake user - send automatic message
					await db.message.create({
						data: {
							chatId: chatRecord.id,
							userId: targetUserId,
							content: "Hello baby. Let's marry!",
							type: 'text'
						}
					});
					
					// Update chat's updatedAt timestamp
					await db.chat.update({
						where: { id: chatRecord.id },
						data: { updatedAt: new Date() }
					});
				}
				
				console.log('[Swipe API] Match created successfully:', { matchId: match.id, matchedUserName: match.matchedUser.name });
				
				// Return match info so frontend can redirect
				return json({
					success: true,
					isMatch: true,
					matchId: match.id,
					matchedUser: match.matchedUser
				});
			}
		}
		
		return json({ success: true, isMatch: false });
	} catch (error) {
		console.error('Swipe error:', error);
		return json({ error: 'Failed to record swipe' }, { status: 500 });
	}
}

