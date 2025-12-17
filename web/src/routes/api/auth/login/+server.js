import { json } from '@sveltejs/kit';
import { lucia } from '$lib/auth/lucia.js';
import { db } from '$lib/db.js';
import { Scrypt } from 'lucia';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	try {
		const { email, password } = await request.json();
		
		// Validate input
		if (!email || !password) {
			return json({ error: 'Email and password required' }, { status: 400 });
		}
		
		// Find the key and verify password manually
		// (Lucia's useKey had issues, so we verify directly with Scrypt)
		const normalizedEmail = email.toLowerCase();
		console.log('Login attempt for email:', normalizedEmail);
		
		const keyRecord = await db.key.findFirst({
			where: {
				providerId: 'email',
				providerUserId: normalizedEmail
			}
		});

		if (!keyRecord) {
			console.log('Login failed: Key not found for email:', normalizedEmail);
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		if (!keyRecord.hashedPassword) {
			console.log('Login failed: No password hash for key:', keyRecord.id);
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		console.log('Key found, verifying password. Hash length:', keyRecord.hashedPassword.length);
		
		// Verify password using Scrypt
		const scrypt = new Scrypt();
		try {
			await scrypt.verify(keyRecord.hashedPassword, password);
			console.log('Password verification: SUCCESS');
		} catch (verifyError) {
			console.log('Password verification: FAILED');
			console.log('Verify error:', verifyError.message);
			console.log('Hash preview:', keyRecord.hashedPassword.substring(0, 50) + '...');
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		// Password is correct, get the user
		const user = await db.user.findUnique({
			where: { id: keyRecord.userId }
		});
		
		if (!user) {
			return json({ error: 'User not found' }, { status: 401 });
		}
		
		// Create session with Lucia
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		
		return json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		console.error('Error name:', error.name);
		console.error('Error message:', error.message);
		console.error('Error code:', error.code);
		
		// Return generic error for unexpected errors
		// Check for common Lucia error patterns
		if (error.message?.includes('AUTH_INVALID_KEY_ID') || 
		    error.message?.includes('AUTH_INVALID_PASSWORD') ||
		    error.name === 'LuciaError' ||
		    error.message?.toLowerCase().includes('invalid') ||
		    error.message?.toLowerCase().includes('key')) {
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}
		
		// Generic error for other cases
		return json({ error: 'Login failed. Please try again.' }, { status: 500 });
	}
}

