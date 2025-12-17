<script>
	import { onMount } from 'svelte';
	import { loadStripe } from '@stripe/stripe-js';
	import Button from '$lib/components/Button.svelte';
	import { Check } from 'lucide-svelte';
	
	let stripe = null;
	let isLoading = false;
	let error = '';
	
	const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
	
	onMount(async () => {
		if (STRIPE_PUBLISHABLE_KEY) {
			stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
		}
	});
	
	async function handleSubscribe() {
		if (!stripe) {
			error = 'Stripe not initialized';
			return;
		}
		
		isLoading = true;
		error = '';
		
		try {
			// Create checkout session
			const response = await fetch('/api/subscribe/create-checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			
			const { sessionId, error: sessionError } = await response.json();
			
			if (sessionError) {
				error = sessionError;
				return;
			}
			
			// Redirect to Stripe Checkout
			const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
			
			if (stripeError) {
				error = stripeError.message;
			}
		} catch (err) {
			error = 'Failed to start checkout. Please try again.';
			console.error('Subscription error:', err);
		} finally {
			isLoading = false;
		}
	}
	
	const features = [
		'Remove all advertisements',
		'Unlimited swipes',
		'See who liked you',
		'Priority customer support'
	];
</script>

<svelte:head>
	<title>Subscribe - Matcher</title>
</svelte:head>

<div class="min-h-screen bg-bg-dark py-12 px-4">
	<div class="max-w-2xl mx-auto">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-text-light mb-4">Remove Ads</h1>
			<p class="text-text-light/60 text-lg">Subscribe to enjoy Matcher without interruptions</p>
		</div>
		
		<div class="card">
			<div class="text-center mb-8">
				<div class="text-5xl font-bold text-crimson-pulse mb-2">$9.99</div>
				<div class="text-text-light/60">per month</div>
			</div>
			
			<ul class="space-y-4 mb-8">
				{#each features as feature}
					<li class="flex items-center gap-3">
						<Check class="text-match-green flex-shrink-0" size={24} />
						<span class="text-text-light">{feature}</span>
					</li>
				{/each}
			</ul>
			
			{#if error}
				<div class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm mb-4">
					{error}
				</div>
			{/if}
			
			<Button
				onclick={handleSubscribe}
				disabled={isLoading || !stripe}
				class="w-full"
			>
				{isLoading ? 'Processing...' : 'Subscribe Now'}
			</Button>
			
			<p class="text-center text-sm text-text-light/60 mt-4">
				Cancel anytime. No hidden fees.
			</p>
		</div>
	</div>
</div>

