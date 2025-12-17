import { json } from '@sveltejs/kit';
import { db } from '$lib/db.js';
import { createKey } from '$lib/auth/lucia.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { token, password } = await request.json();

		if (!token || !password) {
			return json({ error: 'Token and password are required' }, { status: 400 });
		}

		if (password.length < 6) {
			return json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
		}

		// Find the reset token
		const resetToken = await db.passwordResetToken.findUnique({
			where: { token: token },
			include: { user: true }
		});

		if (!resetToken) {
			return json({ error: 'Invalid or expired reset token' }, { status: 400 });
		}

		// Check if token has expired
		if (new Date() > resetToken.expiresAt) {
			// Delete expired token
			await db.passwordResetToken.delete({
				where: { id: resetToken.id }
			});
			return json({ error: 'Reset token has expired' }, { status: 400 });
		}

		// Update the user's password
		// Find the user's email key
		const userKey = await db.key.findFirst({
			where: {
				userId: resetToken.userId,
				providerId: 'email',
				providerUserId: resetToken.user.email.toLowerCase()
			}
		});

		if (userKey) {
			// Update existing key with new password
			await createKey(resetToken.userId, 'email', resetToken.user.email.toLowerCase(), password);
		} else {
			// Create new key if it doesn't exist
			await createKey(resetToken.userId, 'email', resetToken.user.email.toLowerCase(), password);
		}

		// Delete the used reset token
		await db.passwordResetToken.delete({
			where: { id: resetToken.id }
		});

		return json({ success: true, message: 'Password reset successfully' });
	} catch (error) {
		console.error('Reset password error:', error);
		return json({ error: 'Failed to reset password' }, { status: 500 });
	}
}

