import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FAKE_LABEL = ' [FAKE FOR TESTING]';

async function addFakeLabelToProfiles() {
	console.log('Adding "[FAKE FOR TESTING]" label to all fake profiles...\n');

	// Get all fake profiles (emails starting with "fake_")
	const fakeProfiles = await prisma.user.findMany({
		where: {
			email: { startsWith: 'fake_' }
		},
		select: {
			id: true,
			name: true,
			email: true
		}
	});

	console.log(`Found ${fakeProfiles.length} fake profiles\n`);

	let updated = 0;
	let skipped = 0;

	for (const profile of fakeProfiles) {
		// Check if name already has the label
		if (profile.name.includes(FAKE_LABEL)) {
			console.log(`  ⏭️  Skipped: ${profile.name} - already has label`);
			skipped++;
			continue;
		}

		try {
			// Update the name to include the label
			await prisma.user.update({
				where: { id: profile.id },
				data: {
					name: `${profile.name}${FAKE_LABEL}`
				}
			});

			console.log(`  ✓ Updated: ${profile.name} → ${profile.name}${FAKE_LABEL}`);
			updated++;
		} catch (error) {
			console.error(`  ✗ Failed to update ${profile.name}:`, error.message);
		}
	}

	console.log(`\n✅ Successfully updated ${updated} profiles!`);
	console.log(`⏭️  Skipped ${skipped} (already had label)`);
}

addFakeLabelToProfiles()
	.catch((error) => {
		console.error('Error updating fake profiles:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

