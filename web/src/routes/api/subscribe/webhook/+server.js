import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { db } from '$lib/db.js';
import { env } from '$env/dynamic/private';

const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
	apiVersion: '2024-11-20.acacia'
});

const webhookSecret = env.STRIPE_WEBHOOK_SECRET || '';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const body = await request.text();
	const signature = request.headers.get('stripe-signature');
	
	if (!signature) {
		return json({ error: 'No signature' }, { status: 400 });
	}
	
	let event;
	
	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
	} catch (err) {
		console.error('Webhook signature verification failed:', err.message);
		return json({ error: 'Invalid signature' }, { status: 400 });
	}
	
	// Handle the event
	switch (event.type) {
		case 'checkout.session.completed':
			const session = event.data.object;
			if (session.metadata?.userId) {
				await db.user.update({
					where: { id: session.metadata.userId },
					data: {
						isSubscribed: true,
						stripeCustomerId: session.customer
					}
				});
				console.log('Subscription created for user:', session.metadata.userId);
			}
			break;
		
		case 'customer.subscription.deleted':
			const subscription = event.data.object;
			await db.user.updateMany({
				where: { stripeCustomerId: subscription.customer },
				data: { isSubscribed: false }
			});
			console.log('Subscription cancelled for customer:', subscription.customer);
			break;
		
		default:
			console.log(`Unhandled event type: ${event.type}`);
	}
	
	return json({ received: true });
}

