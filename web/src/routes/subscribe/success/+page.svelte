<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { Check } from 'lucide-svelte';
	import { page } from '$app/stores';
	
	onMount(async () => {
		// Get session ID from URL
		const sessionId = $page.url.searchParams.get('session_id');
		
		if (sessionId) {
			// Verify subscription with backend
			try {
				const response = await fetch('/api/subscribe/verify', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ sessionId })
				});
				
				if (response.ok) {
					// Subscription verified, redirect to home after 2 seconds
					setTimeout(() => {
						goto('/');
					}, 2000);
				}
			} catch (error) {
				console.error('Subscription verification error:', error);
			}
		}
	});
</script>

<svelte:head>
	<title>Subscription Successful - Matcher</title>
</svelte:head>

<div class="min-h-screen bg-bg-dark flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="card p-8 text-center">
			<div class="mb-6">
				<div class="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
					<Check class="text-green-500" size={48} />
				</div>
				<h1 class="text-3xl font-bold text-text-light mb-2">Subscription Successful!</h1>
				<p class="text-text-light/60">You now have access to all premium features</p>
			</div>
			
			<div class="space-y-3 mb-8 text-left">
				<div class="flex items-center gap-3">
					<Check class="text-green-500 flex-shrink-0" size={20} />
					<span class="text-text-light">Ads removed</span>
				</div>
				<div class="flex items-center gap-3">
					<Check class="text-green-500 flex-shrink-0" size={20} />
					<span class="text-text-light">Unlimited swipes</span>
				</div>
				<div class="flex items-center gap-3">
					<Check class="text-green-500 flex-shrink-0" size={20} />
					<span class="text-text-light">See who liked you</span>
				</div>
			</div>
			
			<Button on:click={() => goto('/')} class="w-full border-white">
				Continue to App
			</Button>
			
			<p class="text-sm text-text-light/60 mt-4">
				Redirecting to home...
			</p>
		</div>
	</div>
</div>

