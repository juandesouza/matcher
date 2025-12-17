import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
	apiVersion: '2024-11-20.acacia'
});

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	const user = await requireAuth(cookies);
	
	try {
		const { sessionId } = await request.json();
		
		if (!sessionId) {
			return json({ error: 'Session ID required' }, { status: 400 });
		}
		
		// Verify session with Stripe
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		
		if (session.payment_status === 'paid' && session.metadata?.userId === user.id) {
			// Update user subscription status
			await db.user.update({
				where: { id: user.id },
				data: {
					isSubscribed: true,
					stripeCustomerId: session.customer
				}
			});
			
			return json({ success: true });
		}
		
		return json({ error: 'Invalid session' }, { status: 400 });
	} catch (error) {
		console.error('Verification error:', error);
		return json({ error: 'Failed to verify subscription' }, { status: 500 });
	}
}

