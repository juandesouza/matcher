import { json } from '@sveltejs/kit';
import Stripe from 'stripe';
import { requireAuth } from '$lib/auth/utils.js';
import { env } from '$env/dynamic/private';

const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
	apiVersion: '2024-11-20.acacia'
});

/** @type {import('./$types').RequestHandler} */
export async function POST({ cookies, url }) {
	const user = await requireAuth(cookies);
	
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: 'Matcher Premium',
							description: 'Remove ads and unlock premium features'
						},
						recurring: {
							interval: 'month'
						},
						unit_amount: 1000 // $10.00
					},
					quantity: 1
				}
			],
			mode: 'subscription',
			success_url: `matcher://subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `matcher://subscribe/cancel`,
			client_reference_id: user.id,
			metadata: {
				userId: user.id
			}
		});
		
		return json({ sessionId: session.id });
	} catch (error) {
		console.error('Stripe error:', error);
		return json({ error: 'Failed to create checkout session' }, { status: 500 });
	}
}

