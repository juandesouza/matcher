import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Photo URLs (WOMEN ONLY - no male photos)
const womenPhotoUrls = [
	'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', // Woman
	'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', // Woman
	'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', // Woman
	'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400', // Woman
	'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400', // Woman
	'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', // Woman
	'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', // Woman
	'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400', // Woman
	'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400', // Woman
	'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400' // Woman
];

function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

async function updateFakeProfilePhotos() {
	console.log('Updating fake profile photos to use only women photos...\n');

	// Get all fake female profiles
	const fakeProfiles = await prisma.user.findMany({
		where: {
			email: { startsWith: 'fake_' },
			gender: 'female'
		},
		select: {
			id: true,
			name: true,
			email: true,
			photos: true
		}
	});

	console.log(`Found ${fakeProfiles.length} fake female profiles\n`);

	let updated = 0;
	let errors = 0;

	for (const profile of fakeProfiles) {
		try {
			// Get a random woman photo
			const newPhoto = getRandomElement(womenPhotoUrls);
			
			await prisma.user.update({
				where: { id: profile.id },
				data: {
					photos: [newPhoto]
				}
			});

			console.log(`  ✓ Updated: ${profile.name} - new photo: ${newPhoto.substring(0, 50)}...`);
			updated++;
		} catch (error) {
			console.error(`  ✗ Failed to update ${profile.name}:`, error.message);
			errors++;
		}
	}

	console.log(`\n✅ Successfully updated ${updated} profiles!`);
	if (errors > 0) {
		console.log(`❌ Failed to update ${errors} profiles`);
	}
}

updateFakeProfilePhotos()
	.catch((error) => {
		console.error('Error:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

