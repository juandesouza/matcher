import { json } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia.js';
import { db } from '$lib/db.js';
import { randomUUID } from 'crypto';

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies }) {
	try {
		// Create test user with complete profile
		const testUserId = randomUUID();
		const testUserEmail = `test_user_${Date.now()}@test.matcher.app`;
		
		const testUser = await db.user.create({
			data: {
				id: testUserId,
				email: testUserEmail,
				name: 'Test User',
				age: 25,
				gender: 'male',
				bio: 'This is a test account for exploring the app. All data will be deleted after 24 hours.',
				photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
				location: { lat: -14.7930, lng: -39.0460 }, // Ilhéus
				ageRange: { min: 18, max: 99 },
				distanceRange: 50,
				theme: 'dark',
				isSubscribed: false,
				createdAt: new Date()
			}
		});

		// Create auth key for test user (no password needed - they use test-user endpoint)
		await db.key.create({
			data: {
				id: `test:${testUserEmail}`,
				userId: testUserId,
				providerId: 'test',
				providerUserId: testUserEmail,
				hashedPassword: null
			}
		});

		// Create 2 fake users as matches
		const fakeUsers = [
			{
				name: 'Sarah [TEST MATCH]',
				age: 23,
				gender: 'female',
				bio: 'Hi! This is a test match. Feel free to send me a message!',
				photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
				location: { lat: -14.7930, lng: -39.0460 }
			},
			{
				name: 'Emma [TEST MATCH]',
				age: 27,
				gender: 'female',
				bio: 'Testing the chat feature! Send me a message to see how it works.',
				photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
				location: { lat: -15.2930, lng: -39.0760 }
			}
		];

		const createdMatches = [];
		const createdChats = [];

		for (const fakeUserData of fakeUsers) {
			// Create fake user
			const fakeUserId = randomUUID();
			const fakeUserEmail = `test_match_${Date.now()}_${randomUUID().substring(0, 8)}@test.matcher.app`;
			
			const fakeUser = await db.user.create({
				data: {
					id: fakeUserId,
					email: fakeUserEmail,
					name: fakeUserData.name,
					age: fakeUserData.age,
					gender: fakeUserData.gender,
					bio: fakeUserData.bio,
					photos: [fakeUserData.photo],
					location: fakeUserData.location,
					ageRange: { min: 18, max: 99 },
					distanceRange: 50,
					theme: 'dark',
					isSubscribed: false,
					createdAt: new Date()
				}
			});

			// Create auth key for fake user
			await db.key.create({
				data: {
					id: `test:${fakeUserEmail}`,
					userId: fakeUserId,
					providerId: 'test',
					providerUserId: fakeUserEmail,
					hashedPassword: null
				}
			});

			// Create mutual swipes (both users liked each other)
			await db.swipe.create({
				data: {
					userId: testUserId,
					targetUserId: fakeUserId,
					action: 'LIKE'
				}
			});

			await db.swipe.create({
				data: {
					userId: fakeUserId,
					targetUserId: testUserId,
					action: 'LIKE'
				}
			});

			// Create match
			const match = await db.match.create({
				data: {
					userId: testUserId,
					matchedUserId: fakeUserId
				}
			});

			createdMatches.push(match);

			// Create chat
			const smallerId = testUserId < fakeUserId ? testUserId : fakeUserId;
			const largerId = testUserId < fakeUserId ? fakeUserId : testUserId;

			const chat = await db.chat.create({
				data: {
					matchId: match.id,
					userId1: smallerId,
					userId2: largerId
				}
			});

			createdChats.push(chat);

			// Add sample messages to the chat
			const sampleMessages = [
				{
					chatId: chat.id,
					userId: fakeUserId,
					content: `Hi! 👋 This is a test match. I'm ${fakeUserData.name.split(' ')[0]}. Feel free to send me a message!`,
					type: 'text'
				},
				{
					chatId: chat.id,
					userId: fakeUserId,
					content: 'You can test the chat features here. Try sending a message!',
					type: 'text'
				}
			];

			for (const messageData of sampleMessages) {
				await db.message.create({
					data: messageData
				});
			}
		}

		// Create session for test user
		const session = await lucia.createSession(testUserId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		console.log('[Test User] Created test user:', testUserId);
		console.log('[Test User] Created matches:', createdMatches.length);
		console.log('[Test User] Created chats:', createdChats.length);

		return json({
			success: true,
			user: {
				id: testUser.id,
				email: testUser.email,
				name: testUser.name
			},
			matches: createdMatches.length
		});
	} catch (error) {
		console.error('[Test User] Error:', error);
		return json({ 
			error: 'Failed to create test user', 
			message: error.message 
		}, { status: 500 });
	}
}

