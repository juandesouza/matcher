import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Coordinates for the three cities in Bahia, Brazil
const locations = {
	ilheus: { lat: -14.7930, lng: -39.0460 }, // Ilhéus
	una: { lat: -15.2930, lng: -39.0760 }, // Una
	canavieiras: { lat: -15.6750, lng: -38.9470 } // Canavieiras
};

// Male names for fake profiles
const maleNames = [
	'João', 'Pedro', 'Lucas', 'Gabriel', 'Rafael', 'Felipe', 'Bruno', 'Carlos',
	'André', 'Ricardo', 'Marcos', 'Thiago', 'Daniel', 'Rodrigo', 'Eduardo', 'Fernando',
	'Gustavo', 'Leonardo', 'Matheus', 'Vinicius', 'Diego', 'Paulo', 'Roberto', 'Antonio',
	'Henrique', 'Igor', 'Julio', 'Marcelo', 'Nicolas', 'Otavio', 'Renato', 'Sergio'
];

// Bio templates (gender-neutral)
const bioTemplates = [
	'Adoro viajar e conhecer novas culturas',
	'Gosto de ler livros e assistir séries',
	'Fã de música e dança',
	'Amo praia e natureza',
	'Gosto de cozinhar e experimentar novos pratos',
	'Adoro animais e tenho um cachorro',
	'Gosto de praticar esportes e me manter ativo',
	'Amo arte e cultura',
	'Gosto de sair com amigos e me divertir',
	'Adoro fotografia e capturar momentos especiais'
];

// Photo URLs (using placeholder images - MEN ONLY)
const photoUrls = [
	'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', // Man
	'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', // Man
	'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400', // Man
	'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', // Man
	'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400', // Man
	'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400', // Man
	'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400', // Man
	'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400', // Man
	'https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=400', // Man
	'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400' // Man
];

function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function getRandomAge() {
	return Math.floor(Math.random() * (50 - 18 + 1)) + 18;
}

async function createFakeMaleProfiles() {
	console.log('Creating 30 fake male profiles...\n');

	const cities = [
		{ name: 'Ilhéus', location: locations.ilheus, count: 10 },
		{ name: 'Una', location: locations.una, count: 10 },
		{ name: 'Canavieiras', location: locations.canavieiras, count: 10 }
	];

	let created = 0;

	for (const city of cities) {
		console.log(`Creating ${city.count} profiles for ${city.name}...`);
		
		for (let i = 0; i < city.count; i++) {
			const baseName = getRandomElement(maleNames);
			const name = `${baseName} [FAKE FOR TESTING]`;
			const age = getRandomAge();
			const bio = getRandomElement(bioTemplates);
			const photo = getRandomElement(photoUrls);
			const email = `fake_${randomUUID().substring(0, 8)}_${Date.now()}_${i}@example.com`;

			try {
				const user = await prisma.user.create({
					data: {
						email,
						name,
						age,
						gender: 'male',
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

	console.log(`\n✅ Successfully created ${created} fake male profiles!`);
}

createFakeMaleProfiles()
	.catch((error) => {
		console.error('Error creating fake male profiles:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

