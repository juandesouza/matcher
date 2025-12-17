import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userEmail = 'juandesouza7@gmail.com';

async function checkUserLocation() {
	console.log(`Checking location for user: ${userEmail}\n`);

	const user = await prisma.user.findUnique({
		where: { email: userEmail },
		select: {
			id: true,
			name: true,
			email: true,
			location: true,
			distanceRange: true,
			ageRange: true
		}
	});

	if (!user) {
		console.error(`❌ User not found!`);
		process.exit(1);
	}

	console.log(`User: ${user.name}`);
	console.log(`Location:`, user.location);
	console.log(`Distance Range: ${user.distanceRange} km`);
	console.log(`Age Range: ${user.ageRange?.min} - ${user.ageRange?.max}\n`);

	// Get fake profiles and calculate distances
	const fakeProfiles = await prisma.user.findMany({
		where: {
			email: { startsWith: 'fake_' },
			gender: 'female'
		},
		select: {
			id: true,
			name: true,
			location: true
		}
	});

	if (!user.location) {
		console.log('⚠️  User has no location set! This is why no cards are showing.');
		console.log('The app needs geolocation to work. Make sure you allow location access during setup.');
	} else {
		console.log(`\nChecking distances to ${fakeProfiles.length} fake profiles:\n`);
		
		// Haversine formula
		function calculateDistance(lat1, lon1, lat2, lon2) {
			const R = 6371; // Earth's radius in km
			const dLat = (lat2 - lat1) * Math.PI / 180;
			const dLon = (lon2 - lon1) * Math.PI / 180;
			const a = 
				Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
				Math.sin(dLon/2) * Math.sin(dLon/2);
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			return R * c;
		}

		let withinRange = 0;
		let outOfRange = 0;

		for (const profile of fakeProfiles) {
			if (profile.location) {
				const distance = calculateDistance(
					user.location.lat,
					user.location.lng,
					profile.location.lat,
					profile.location.lng
				);
				const inRange = distance <= user.distanceRange;
				if (inRange) {
					withinRange++;
					console.log(`  ✓ ${profile.name}: ${distance.toFixed(1)} km (within range)`);
				} else {
					outOfRange++;
					console.log(`  ✗ ${profile.name}: ${distance.toFixed(1)} km (out of range, max: ${user.distanceRange} km)`);
				}
			}
		}

		console.log(`\n📊 Summary:`);
		console.log(`  Within range (${user.distanceRange} km): ${withinRange} profiles`);
		console.log(`  Out of range: ${outOfRange} profiles`);
		
		if (withinRange === 0) {
			console.log(`\n⚠️  No profiles within your distance range!`);
			console.log(`💡 Solution: Increase your distance range in settings, or update your location.`);
		}
	}

	await prisma.$disconnect();
}

checkUserLocation().catch(console.error);

