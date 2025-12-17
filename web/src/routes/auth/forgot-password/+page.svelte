<script>
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { Mail, Loader2, ArrowLeft } from 'lucide-svelte';
	import { _ } from 'svelte-i18n';
	
	export let data;
	$: void data;

	let email = '';
	let isLoading = false;
	let error = '';
	let success = false;
	
	async function handleForgotPassword(e) {
		e.preventDefault();
		isLoading = true;
		error = '';
		success = false;
		
		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});
			
			const data = await response.json();
			
			if (response.ok) {
				success = true;
			} else {
				error = data.error || 'Failed to send reset email';
			}
		} catch (err) {
			console.error('Forgot password error:', err);
			error = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Forgot Password - Matcher</title>
</svelte:head>

<div class="min-h-screen bg-bg-dark flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-text-light mb-2">Forgot Password</h1>
			<p class="text-text-light/60">Enter your email address and we'll send you a link to reset your password.</p>
		</div>
		
		<div class="card p-6">
			<form on:submit={handleForgotPassword} class="space-y-4">
				{#if error}
					<div class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
						{error}
					</div>
				{/if}
				
				{#if success}
					<div class="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
						Email sent successfully! Please check your inbox for password reset instructions.
					</div>
				{/if}
				
				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="email-input">Email</label>
					<div class="relative">
						<Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light/60" size={20} />
						<input
							id="email-input"
							type="email"
							bind:value={email}
							required
							disabled={success}
							class="w-full bg-gray-800 text-text-light px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse disabled:opacity-50"
							placeholder="your@email.com"
						/>
					</div>
				</div>
				
				<Button type="submit" disabled={isLoading || success} class="w-full border-white">
					{#if isLoading}
						<Loader2 class="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 animate-spin text-white" />
					{:else if success}
						Email Sent
					{:else}
						Send Reset Link
					{/if}
				</Button>
			</form>
			
			<div class="mt-6 text-center">
				<a href="/auth/login" class="text-sm text-crimson-pulse hover:underline inline-flex items-center gap-2">
					<ArrowLeft size={16} />
					Back to Login
				</a>
			</div>
		</div>
	</div>
</div>

