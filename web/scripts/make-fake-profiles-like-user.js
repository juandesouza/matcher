import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userEmail = 'juandesouza7@gmail.com';

async function makeFakeProfilesLikeUser() {
	console.log(`Making all fake female profiles like user: ${userEmail}\n`);

	// Find the user
	const user = await prisma.user.findUnique({
		where: { email: userEmail }
	});

	if (!user) {
		console.error(`❌ User with email ${userEmail} not found!`);
		process.exit(1);
	}

	console.log(`✅ Found user: ${user.name} (${user.id})\n`);

	// Get all fake female profiles (they have emails starting with "fake_")
	const fakeProfiles = await prisma.user.findMany({
		where: {
			email: { startsWith: 'fake_' },
			gender: 'female'
		},
		select: {
			id: true,
			name: true,
			email: true
		}
	});

	console.log(`Found ${fakeProfiles.length} fake female profiles\n`);

	let created = 0;
	let skipped = 0;

	for (const profile of fakeProfiles) {
		try {
			// Check if swipe already exists
			const existingSwipe = await prisma.swipe.findUnique({
				where: {
					userId_targetUserId: {
						userId: profile.id,
						targetUserId: user.id
					}
				}
			});

			if (existingSwipe) {
				console.log(`  ⏭️  Skipped: ${profile.name} - swipe already exists`);
				skipped++;
				continue;
			}

			// Create a LIKE swipe from fake profile to user
			await prisma.swipe.create({
				data: {
					userId: profile.id,
					targetUserId: user.id,
					action: 'LIKE'
				}
			});

			console.log(`  ✓ Created LIKE from ${profile.name} to ${user.name}`);
			created++;
		} catch (error) {
			console.error(`  ✗ Failed to create swipe for ${profile.name}:`, error.message);
		}
	}

	console.log(`\n✅ Successfully created ${created} swipes!`);
	console.log(`⏭️  Skipped ${skipped} (already existed)`);
	console.log(`\nNow when you swipe right on any of these profiles, you'll get a match! 🎉`);
}

makeFakeProfilesLikeUser()
	.catch((error) => {
		console.error('Error making fake profiles like user:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

