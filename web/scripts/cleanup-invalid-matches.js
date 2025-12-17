import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userEmail = 'juandesouza7@gmail.com';

async function cleanupInvalidMatches() {
	console.log(`Cleaning up invalid matches for user: ${userEmail}\n`);

	// Find the user
	const user = await prisma.user.findUnique({
		where: { email: userEmail }
	});

	if (!user) {
		console.error(`❌ User with email ${userEmail} not found!`);
		process.exit(1);
	}

	console.log(`✅ Found user: ${user.name} (${user.id})\n`);

	// Get all matches for this user
	const matches = await prisma.match.findMany({
		where: {
			OR: [
				{ userId: user.id },
				{ matchedUserId: user.id }
			]
		},
		include: {
			user: {
				select: {
					id: true,
					name: true
				}
			},
			matchedUser: {
				select: {
					id: true,
					name: true
				}
			}
		}
	});

	console.log(`Found ${matches.length} matches to check\n`);

	let deleted = 0;
	let valid = 0;
	let errors = 0;

	for (const match of matches) {
		const otherUserId = match.userId === user.id ? match.matchedUserId : match.userId;
		
		try {
			// Check if there's still a mutual like (both users liked each other)
			const userSwipe = await prisma.swipe.findUnique({
				where: {
					userId_targetUserId: {
						userId: user.id,
						targetUserId: otherUserId
					}
				}
			});

			const otherUserSwipe = await prisma.swipe.findUnique({
				where: {
					userId_targetUserId: {
						userId: otherUserId,
						targetUserId: user.id
					}
				}
			});

			// If either swipe doesn't exist or isn't a like, the match is invalid
			if (!userSwipe || userSwipe.action !== 'like' || !otherUserSwipe || otherUserSwipe.action !== 'like') {
				// Delete the match and associated chat
				await prisma.chat.deleteMany({
					where: { matchId: match.id }
				});

				await prisma.match.delete({
					where: { id: match.id }
				});

				const otherUserName = match.userId === user.id ? match.matchedUser.name : match.user.name;
				console.log(`  ✓ Deleted invalid match with: ${otherUserName}`);
				deleted++;
			} else {
				console.log(`  ✓ Valid match with: ${match.userId === user.id ? match.matchedUser.name : match.user.name}`);
				valid++;
			}
		} catch (error) {
			console.error(`  ✗ Failed to process match ${match.id}:`, error.message);
			errors++;
		}
	}

	console.log(`\n✅ Successfully deleted ${deleted} invalid matches!`);
	console.log(`✓ Kept ${valid} valid matches`);
	if (errors > 0) {
		console.log(`❌ Failed to process ${errors} matches`);
	}
}

cleanupInvalidMatches()
	.catch((error) => {
		console.error('Error:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

