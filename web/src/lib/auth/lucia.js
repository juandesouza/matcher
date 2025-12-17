import { Lucia } from 'lucia';
import { PostgresJsAdapter } from '@lucia-auth/adapter-postgresql';
import postgres from 'postgres';
import { dev } from '$app/environment';
import { generateIdFromEntropySize } from 'lucia';
import { Scrypt } from 'lucia';
import { env } from '$env/dynamic/private';
import { db } from '$lib/db.js';

// Initialize PostgreSQL connection using SvelteKit's env
const sql = postgres(env.DATABASE_URL || process.env.DATABASE_URL, {
	prepare: false
});

// Create adapter
// Note: The table is stored as "User" (capital U) in the database
const adapter = new PostgresJsAdapter(sql, {
	user: 'User',
	session: 'session',
	key: 'key'
});

// Create Scrypt instance for password hashing
const scrypt = new Scrypt();

// Create Lucia instance
export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// Set to true in production if using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			email: attributes.email,
			name: attributes.name,
			age: attributes.age,
			bio: attributes.bio,
			photos: attributes.photos,
			location: attributes.location,
			ageRange: attributes.ageRange,
			distanceRange: attributes.distanceRange,
			theme: attributes.theme,
			isSubscribed: attributes.isSubscribed,
			stripeCustomerId: attributes.stripeCustomerId,
			provider: attributes.provider,
			providerId: attributes.providerId,
			createdAt: attributes.createdAt,
			updatedAt: attributes.updatedAt
		};
	}
});

// Helper function to create keys (since createKey might not be available in all Lucia versions)
export async function createKey(userId, providerId, providerUserId, password = null) {
	let hashedPassword = null;
	if (password) {
		const scrypt = new Scrypt();
		hashedPassword = await scrypt.hash(password);
	}
	
	// Key ID format: providerId:providerUserId
	const key = `${providerId}:${providerUserId}`;
	
	// Use Prisma to upsert the key (create or update if exists)
	// This prevents unique constraint errors when the key already exists
	await db.key.upsert({
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

