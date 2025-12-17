import { json } from '@sveltejs/kit';
import { lucia, createKey } from '$lib/auth/lucia.js';
import { db } from '$lib/db.js';
import bcrypt from 'bcryptjs';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	try {
		const { name, email, password } = await request.json();

		if (!name || !email || !password) {
			return json({ error: 'Name, email and password are required.' }, { status: 400 });
		}

		if (password.length < 6) {
			return json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
		}

		// Check if user already exists
		const existingUser = await db.user.findUnique({
			where: { email: email.toLowerCase() }
		});

		if (existingUser) {
			// Check if user has a key - if not, they might have been created but key creation failed
			// In that case, we should create the key for them
			const existingKey = await db.key.findFirst({
				where: {
					userId: existingUser.id,
					providerId: 'email',
					providerUserId: email.toLowerCase()
				}
			});

			if (existingKey) {
				return json({ error: 'Email already registered' }, { status: 400 });
			}

			// User exists but no key - create the key for them
			await createKey(existingUser.id, 'email', email.toLowerCase(), password);

			// Create session
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			return json(
				{
					success: true,
					user: {
						id: existingUser.id,
						email: existingUser.email,
						name: existingUser.name
					}
				},
				{ status: 201 }
			);
		}

		// Create user in database
		// Note: We still store password hash in User table for backward compatibility,
		// but Lucia Auth uses the Key table for authentication
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await db.user.create({
			data: {
				email: email.toLowerCase(),
				name,
				password: hashedPassword,
				provider: 'email',
				photos: [],
				ageRange: { min: 18, max: 99 },
				distanceRange: 50,
				theme: 'dark',
				isSubscribed: false
			}
		});

		// Create key for Lucia Auth
		// Pass plain password - it will be hashed using Scrypt
		await createKey(user.id, 'email', email.toLowerCase(), password);

		// Create session
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return json(
			{
				success: true,
				user: {
					id: user.id,
					email: user.email,
					name: user.name
				}
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Signup error:', error);
		console.error('Error name:', error.name);
		console.error('Error message:', error.message);
		console.error('Error stack:', error.stack);
		console.error('Error code:', error.code);
		
		// Handle unique constraint violations
		if (error.code === 'P2002') {
			return json({ error: 'Email already registered' }, { status: 400 });
		}
		
		// Return more detailed error in development
		const errorMessage = process.env.NODE_ENV === 'development' 
			? `Signup failed: ${error.message || 'Unknown error'}`
			: 'Signup failed';
		
		return json({ error: errorMessage }, { status: 500 });
	}
}
