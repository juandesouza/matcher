import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userEmail = 'juandesouza7@gmail.com';
const newDistanceRange = 1000; // 1000 km to see all fake profiles

async function increaseDistanceRange() {
	console.log(`Increasing distance range for user: ${userEmail}\n`);

	const user = await prisma.user.update({
		where: { email: userEmail },
		data: {
			distanceRange: newDistanceRange
		},
		select: {
			name: true,
			distanceRange: true
		}
	});

	console.log(`✅ Updated ${user.name}'s distance range to ${user.distanceRange} km`);
	console.log(`\nNow you should see all 30 fake profiles! 🎉`);
}

increaseDistanceRange()
	.catch((error) => {
		console.error('Error updating distance range:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

