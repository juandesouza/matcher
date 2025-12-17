import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Coordinates for the three cities in Bahia, Brazil
const locations = {
	ilheus: { lat: -14.7930, lng: -39.0460 }, // Ilhéus
	una: { lat: -15.2930, lng: -39.0760 }, // Una
	canavieiras: { lat: -15.6750, lng: -38.9470 } // Canavieiras
};

// Female names for fake profiles
const femaleNames = [
	'Ana', 'Maria', 'Juliana', 'Fernanda', 'Camila', 'Patricia', 'Mariana', 'Gabriela',
	'Beatriz', 'Isabela', 'Larissa', 'Vanessa', 'Carolina', 'Amanda', 'Bruna', 'Renata',
	'Sofia', 'Laura', 'Valentina', 'Isabella', 'Manuela', 'Alice', 'Helena', 'Luiza',
	'Julia', 'Livia', 'Antonella', 'Rafaela', 'Maria Eduarda', 'Giovanna', 'Leticia', 'Yasmin'
];

// Bio templates
const bioTemplates = [
	'Adoro viajar e conhecer novas culturas',
	'Gosto de ler livros e assistir séries',
	'Fã de música e dança',
	'Amo praia e natureza',
	'Gosto de cozinhar e experimentar novos pratos',
	'Adoro animais e tenho um cachorro',
	'Gosto de praticar esportes e me manter ativa',
	'Amo arte e cultura',
	'Gosto de sair com amigos e me divertir',
	'Adoro fotografia e capturar momentos especiais'
];

// Photo URLs (using placeholder images - WOMEN ONLY)
const photoUrls = [
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

function getRandomAge() {
	return Math.floor(Math.random() * (50 - 18 + 1)) + 18;
}

async function createFakeProfiles() {
	console.log('Creating 30 fake female profiles...\n');

	const cities = [
		{ name: 'Ilhéus', location: locations.ilheus, count: 10 },
		{ name: 'Una', location: locations.una, count: 10 },
		{ name: 'Canavieiras', location: locations.canavieiras, count: 10 }
	];

	let created = 0;

	for (const city of cities) {
		console.log(`Creating ${city.count} profiles for ${city.name}...`);
		
		for (let i = 0; i < city.count; i++) {
			const baseName = getRandomElement(femaleNames);
			const name = `${baseName} [FAKE FOR TESTING]`;
			const age = getRandomAge();
			const bio = getRandomElement(bioTemplates);
			const photo = getRandomElement(photoUrls);
			const email = `fake_${randomUUID().substring(0, 8)}_${Date.now()}@example.com`;

			try {
				const user = await prisma.user.create({
					data: {
						email,
						name,
						age,
						gender: 'female',
						bio,
						photos: [photo],
						location: city.location,
						ageRange: { min: 18, max: 99 },
						distanceRange: 50,
						theme: 'dark',
						isSubscribed: false
					}
				});

				console.log(`  ✓ Created: ${name} (${age} years old) - ${city.name}`);
				created++;
			} catch (error) {
				console.error(`  ✗ Failed to create profile for ${name}:`, error.message);
			}
		}
	}

	console.log(`\n✅ Successfully created ${created} fake profiles!`);
}

createFakeProfiles()
	.catch((error) => {
		console.error('Error creating fake profiles:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

