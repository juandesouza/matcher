import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
	// For development, use a test account or SMTP settings
	// In production, use real SMTP credentials
	if (env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD) {
		return nodemailer.createTransport({
			host: env.SMTP_HOST,
			port: parseInt(env.SMTP_PORT),
			secure: env.SMTP_PORT === '465', // true for 465, false for other ports
			auth: {
				user: env.SMTP_USER,
				pass: env.SMTP_PASSWORD
			}
		});
	}

	// Fallback: Use Gmail with app password (for development)
	// Note: You need to enable "Less secure app access" or use an App Password
	if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
		return nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: env.GMAIL_USER,
				pass: env.GMAIL_APP_PASSWORD
			}
		});
	}

	// Development fallback: Use Ethereal Email (test account)
	// This will log the email URL to console instead of actually sending
	console.warn('No email configuration found. Emails will not be sent.');
	return null;
};

export async function sendPasswordResetEmail(email, resetToken, resetUrl) {
	const transporter = createTransporter();
	
	if (!transporter) {
		console.error('Email transporter not configured. Cannot send password reset email.');
		console.log('Password reset token:', resetToken);
		console.log('Reset URL:', resetUrl);
		return false;
	}

	// Use APP_URL from env
	// Make sure it's not localhost for mobile compatibility
	let appUrl = env.APP_URL || 'http://192.168.100.109:5173';
	
	// Ensure we're not using localhost (doesn't work on mobile)
	if (appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
		appUrl = 'http://192.168.100.109:5173';
	}
	
	const webResetUrl = resetUrl || `${appUrl}/auth/reset-password?token=${resetToken}`;
	const mobileDeepLink = `matcher://reset-password?token=${resetToken}`;
	const fullResetUrl = webResetUrl;

	const mailOptions = {
		from: env.SMTP_FROM || env.GMAIL_USER || 'noreply@matcher.com',
		to: email,
		subject: 'Reset Your Password - Matcher',
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.button { display: inline-block; padding: 12px 24px; background-color: #C62828; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
					.footer { margin-top: 30px; font-size: 12px; color: #666; }
				</style>
			</head>
			<body>
				<div class="container">
					<h1>Reset Your Password</h1>
					<p>You requested to reset your password for your Matcher account.</p>
					<p>Click the button below to reset your password:</p>
					<a href="${fullResetUrl}" class="button">Reset Password</a>
					<p>Or copy and paste this link into your browser:</p>
					<p style="word-break: break-all;">${fullResetUrl}</p>
					<p style="margin-top: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
						<strong>Using the mobile app?</strong><br>
						If you have the Matcher app installed, you can also use this deep link:<br>
						<code style="word-break: break-all; font-size: 12px;">${mobileDeepLink}</code>
					</p>
					<p>This link will expire in 1 hour.</p>
					<p>If you didn't request this password reset, please ignore this email.</p>
					<div class="footer">
						<p>© Matcher - All rights reserved</p>
					</div>
				</div>
			</body>
			</html>
		`,
		text: `
			Reset Your Password
			
			You requested to reset your password for your Matcher account.
			
			Click this link to reset your password:
			${fullResetUrl}
			
			Mobile app deep link:
			${mobileDeepLink}
			
			This link will expire in 1 hour.
			
			If you didn't request this password reset, please ignore this email.
		`
	};

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log('Password reset email sent:', info.messageId);
		return true;
	} catch (error) {
		console.error('Error sending password reset email:', error);
		return false;
	}
}

