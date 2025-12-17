import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userEmail = 'juandesouza7@gmail.com';

async function removeUserLikes() {
	console.log(`Removing all likes from user: ${userEmail}\n`);

	// Find the user
	const user = await prisma.user.findUnique({
		where: { email: userEmail }
	});

	if (!user) {
		console.error(`❌ User with email ${userEmail} not found!`);
		process.exit(1);
	}

	console.log(`✅ Found user: ${user.name} (${user.id})\n`);

	// Get all likes (swipes with action='LIKE' - uppercase as per API)
	const likes = await prisma.swipe.findMany({
		where: {
			userId: user.id,
			action: 'LIKE'
		},
		select: {
			id: true,
			targetUserId: true,
			action: true,
			createdAt: true
		}
	});

	console.log(`Found ${likes.length} likes to remove\n`);

	if (likes.length === 0) {
		console.log('No likes to remove!');
		await prisma.$disconnect();
		return;
	}

	// Get all matches where this user is involved (as userId or matchedUserId)
	const matches = await prisma.match.findMany({
		where: {
			OR: [
				{ userId: user.id },
				{ matchedUserId: user.id }
			]
		},
		select: {
			id: true,
			userId: true,
			matchedUserId: true
		}
	});

	console.log(`Found ${matches.length} matches to remove\n`);

	// Delete chats associated with these matches
	let deletedChats = 0;
	for (const match of matches) {
		try {
			const chats = await prisma.chat.findMany({
				where: { matchId: match.id }
			});
			for (const chat of chats) {
				await prisma.chat.delete({
					where: { id: chat.id }
				});
				deletedChats++;
			}
		} catch (error) {
			console.error(`  ✗ Failed to delete chats for match ${match.id}:`, error.message);
		}
	}

	// Delete matches
	let deletedMatches = 0;
	for (const match of matches) {
		try {
			await prisma.match.delete({
				where: { id: match.id }
			});
			console.log(`  ✓ Deleted match: ${match.id}`);
			deletedMatches++;
		} catch (error) {
			console.error(`  ✗ Failed to delete match ${match.id}:`, error.message);
		}
	}

	// Delete likes (swipes)
	let deletedLikes = 0;
	let errors = 0;

	for (const like of likes) {
		try {
			await prisma.swipe.delete({
				where: { id: like.id }
			});
			console.log(`  ✓ Deleted like for target user: ${like.targetUserId}`);
			deletedLikes++;
		} catch (error) {
			console.error(`  ✗ Failed to delete like ${like.id}:`, error.message);
			errors++;
		}
	}

	console.log(`\n✅ Successfully deleted:`);
	console.log(`   - ${deletedLikes} likes`);
	console.log(`   - ${deletedMatches} matches`);
	console.log(`   - ${deletedChats} chats`);
	if (errors > 0) {
		console.log(`❌ Failed to delete ${errors} items`);
	}
}

removeUserLikes()
	.catch((error) => {
		console.error('Error:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

