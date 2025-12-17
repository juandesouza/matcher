import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { randomBytes } from 'crypto';
import { sendPasswordResetEmail } from '$lib/email.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { email } = await request.json();

		if (!email || !email.trim()) {
			return json({ error: 'Email is required' }, { status: 400 });
		}

		// Check if user exists
		const user = await db.user.findUnique({
			where: { email: email.toLowerCase() }
		});

		// Always return success message to prevent email enumeration
		// But only send email if user exists
		if (user) {
			// Generate reset token
			const token = randomBytes(32).toString('hex');
			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

			// Delete any existing reset tokens for this user
			await db.passwordResetToken.deleteMany({
				where: { userId: user.id }
			});

			// Create new reset token
			await db.passwordResetToken.create({
				data: {
					userId: user.id,
					token: token,
					expiresAt: expiresAt
				}
			});

			// Send reset email
			const emailSent = await sendPasswordResetEmail(user.email, token);
			
			// In development, if email wasn't sent, log the reset URL
			if (!emailSent && process.env.NODE_ENV === 'development') {
				const appUrl = process.env.APP_URL || 'http://localhost:5173';
				const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;
				console.log('\n========================================');
				console.log('🔐 PASSWORD RESET TOKEN (DEVELOPMENT)');
				console.log('========================================');
				console.log('Email:', user.email);
				console.log('Reset URL:', resetUrl);
				console.log('Token:', token);
				console.log('========================================\n');
			}
		}

		// Always return success to prevent email enumeration
		// In development, include the reset URL if email wasn't configured
		const response = { 
			success: true, 
			message: 'If an account with that email exists, a password reset link has been sent.' 
		};
		
		// In development mode, if email config is missing, include the token in response
		if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST && !process.env.GMAIL_USER) {
			// Re-fetch user to get reset token (user variable is scoped inside if block above)
			const devUser = await db.user.findUnique({
				where: { email: email.toLowerCase() }
			});
			if (devUser) {
				const resetToken = await db.passwordResetToken.findFirst({
					where: { userId: devUser.id },
					orderBy: { createdAt: 'desc' }
				});
				if (resetToken) {
					const appUrl = process.env.APP_URL || 'http://localhost:5173';
					response.resetUrl = `${appUrl}/auth/reset-password?token=${resetToken.token}`;
					response.message = 'Email not configured. Use the reset URL below:';
				}
			}
		}
		
		return json(response);
	} catch (error) {
		console.error('Forgot password error:', error);
		return json({ error: 'Failed to process request' }, { status: 500 });
	}
}

