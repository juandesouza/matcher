import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Scrypt } from 'lucia';

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

// Male names for fake profiles
const maleNames = [
	'João', 'Pedro', 'Lucas', 'Gabriel', 'Rafael', 'Felipe', 'Bruno', 'Carlos',
	'André', 'Ricardo', 'Marcos', 'Thiago', 'Daniel', 'Rodrigo', 'Eduardo', 'Fernando',
	'Gustavo', 'Leonardo', 'Matheus', 'Vinicius', 'Diego', 'Paulo', 'Roberto', 'Antonio',
	'Henrique', 'Igor', 'Julio', 'Marcelo', 'Nicolas', 'Otavio', 'Renato', 'Sergio'
];

// Bio templates
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

// Photo URLs for women
const womenPhotoUrls = [
	'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
	'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
	'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
	'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
	'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
	'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
	'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
	'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
	'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
	'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400'
];

// Photo URLs for men
const menPhotoUrls = [
	'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
	'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
	'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
	'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
	'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400',
	'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400',
	'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400',
	'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400',
	'https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=400',
	'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400'
];

function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function getRandomAge() {
	return Math.floor(Math.random() * (50 - 18 + 1)) + 18;
}

// Helper function to create authentication keys (similar to createKey in lucia.js)
async function createKey(userId, providerId, providerUserId, password = null) {
	let hashedPassword = null;
	if (password) {
		const scrypt = new Scrypt();
		hashedPassword = await scrypt.hash(password);
	}
	
	// Key ID format: providerId:providerUserId
	const key = `${providerId}:${providerUserId}`;
	
	// Use Prisma to upsert the key
	await prisma.key.upsert({
		where: {
			id: key
		},
		update: {
			userId: userId,
			hashedPassword: hashedPassword
		},
		create: {
			id: key,
			userId: userId,
			providerId: providerId,
			providerUserId: providerUserId,
			hashedPassword: hashedPassword
		}
	});
	
	return key;
}

async function createFakeUsers(gender, count) {
	const names = gender === 'female' ? femaleNames : maleNames;
	const photoUrls = gender === 'female' ? womenPhotoUrls : menPhotoUrls;
	const genderLabel = gender === 'female' ? 'women' : 'men';
	
	console.log(`\nCreating ${count} fake ${genderLabel}...\n`);

	// For small counts, just use one city
	const cities = count <= 4 
		? [{ name: 'Ilhéus', location: locations.ilheus, count: count }]
		: [
			{ name: 'Ilhéus', location: locations.ilheus, count: Math.floor(count / 3) },
			{ name: 'Una', location: locations.una, count: Math.floor(count / 3) },
			{ name: 'Canavieiras', location: locations.canavieiras, count: count - (2 * Math.floor(count / 3)) }
		];

	let created = 0;

	for (const city of cities) {
		console.log(`Creating ${city.count} ${genderLabel} profiles for ${city.name}...`);
		
		for (let i = 0; i < city.count; i++) {
			const baseName = getRandomElement(names);
			const name = `${baseName} [FAKE FOR TESTING]`;
			const age = getRandomAge();
			const bio = getRandomElement(bioTemplates);
			const photo = getRandomElement(photoUrls);
			const email = `fake_${gender}_${randomUUID().substring(0, 8)}_${Date.now()}_${i}@example.com`;

			try {
				// Create user
				const user = await prisma.user.create({
					data: {
						email,
						name,
						age,
						gender,
						bio,
						photos: [photo],
						location: city.location,
						ageRange: { min: 18, max: 99 },
						distanceRange: 50,
						theme: 'dark',
						isSubscribed: false
					}
				});

				// Create authentication key for the fake user
				// Using 'email' provider with the email as providerUserId
				// No password needed for fake users (they won't log in)
				await createKey(user.id, 'email', email.toLowerCase(), null);

				console.log(`  ✓ Created: ${name} (${age} years old) - ${city.name}`);
				created++;
			} catch (error) {
				console.error(`  ✗ Failed to create profile for ${name}:`, error.message);
			}
		}
	}

	console.log(`\n✅ Successfully created ${created} fake ${genderLabel} profiles!`);
	return created;
}

async function main() {
	console.log('🌱 Starting database seed...\n');
	console.log('This will create 2 fake men and 2 fake women in the database.\n');

	// Delete all existing fake users first (if tables exist)
	console.log('🗑️  Deleting existing fake users...');
	try {
		const deleteResult = await prisma.user.deleteMany({
			where: {
				email: { startsWith: 'fake_' }
			}
		});
		console.log(`   Deleted ${deleteResult.count} existing fake users.\n`);

		// Also delete associated keys for fake users
		try {
			await prisma.key.deleteMany({
				where: {
					providerUserId: { startsWith: 'fake_' }
				}
			});
		} catch (error) {
			// Key table might not exist, that's okay
			console.log('   (Skipping key deletion - table may not exist)\n');
		}
	} catch (error) {
		if (error.code === 'P2021') {
			console.log('   ⚠️  Database tables do not exist yet. Run migrations first: npm run db:migrate\n');
			console.log('   Continuing to create users (migrations should create tables)...\n');
		} else {
			throw error;
		}
	}

	// Create 2 fake women
	const womenCreated = await createFakeUsers('female', 2);

	// Create 2 fake men
	const menCreated = await createFakeUsers('male', 2);

	console.log('\n' + '='.repeat(50));
	console.log(`✅ Seed completed successfully!`);
	console.log(`   Created ${womenCreated} fake women`);
	console.log(`   Created ${menCreated} fake men`);
	console.log(`   Total: ${womenCreated + menCreated} fake users`);
	console.log('='.repeat(50));
}

main()
	.catch((error) => {
		console.error('❌ Error seeding database:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

