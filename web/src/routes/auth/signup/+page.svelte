<script>
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';
	import { Mail, Lock, User, Loader2 } from 'lucide-svelte';
	import { _ } from 'svelte-i18n';

	export let data;
	$: void data;

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let acceptTerms = false;
	let isLoading = false;
	let error = '';
	let success = false;

	const GOOGLE_OAUTH_URL = import.meta.env.VITE_GOOGLE_OAUTH_URL || '/api/auth/google';

	/**
	 * @param {SubmitEvent} event
	 */
	async function handleSignup(event) {
		event.preventDefault();
		error = '';

		if (!acceptTerms) {
			error = 'Please accept the Terms of Use and Privacy Policy.';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}

		try {
			isLoading = true;
			error = '';
			success = false;
			
			const response = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password })
			});

			const payload = await response.json();

			if (!response.ok) {
				error = payload.error || 'Unable to create your account right now.';
				return;
			}

			// Show success message
			success = true;
			// Clear form
			name = '';
			email = '';
			password = '';
			confirmPassword = '';
			acceptTerms = false;
		} catch (err) {
			console.error('Signup error:', err);
			error = 'Signup failed. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>{$_('auth.signup')} - Matcher</title>
</svelte:head>

<div class="min-h-screen bg-bg-dark flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-text-light mb-2">{$_('auth.signup')}</h1>
			<p class="text-text-light/60">{$_('app.tagline')}</p>
		</div>

		<div class="card p-6 space-y-5">
			{#if success}
				<div class="space-y-4">
					<div class="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
						Account created successfully! You can now log in.
					</div>
					<a href="/auth/login" class="block">
						<Button class="w-full border-white">
							Go to Login
						</Button>
					</a>
				</div>
			{:else}
				<form class="space-y-4" on:submit={handleSignup}>
					{#if error}
						<div class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
							{error}
						</div>
					{/if}

				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="name-input">Name</label>
					<div class="relative">
						<User class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light/60" size={20} />
						<input
							id="name-input"
							type="text"
							bind:value={name}
							required
							class="w-full bg-gray-800 text-text-light px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
							placeholder="Your name"
						/>
					</div>
				</div>

				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="email-input">{$_('auth.email')}</label>
					<div class="relative">
						<Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light/60" size={20} />
						<input
							id="email-input"
							type="email"
							bind:value={email}
							required
							class="w-full bg-gray-800 text-text-light px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
							placeholder="your@email.com"
						/>
					</div>
				</div>

				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="password-input">{$_('auth.password')}</label>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light/60" size={20} />
						<input
							id="password-input"
							type="password"
							bind:value={password}
							required
							minlength="6"
							class="w-full bg-gray-800 text-text-light px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
							placeholder="••••••••"
						/>
					</div>
				</div>

				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="confirm-password-input">Confirm password</label>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light/60" size={20} />
						<input
							id="confirm-password-input"
							type="password"
							bind:value={confirmPassword}
							required
							minlength="6"
							class="w-full bg-gray-800 text-text-light px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
							placeholder="Confirm password"
						/>
					</div>
				</div>

				<label class="flex items-start gap-3 text-sm text-text-light/80 cursor-pointer">
					<input type="checkbox" bind:checked={acceptTerms} class="mt-1 w-4 h-4" />
					<span>
						I agree to the
						<a href="/terms" class="text-crimson-pulse underline">Terms of Use</a> and
						<a href="/privacy" class="text-crimson-pulse underline">Privacy Policy</a>.
					</span>
				</label>

				<Button type="submit" disabled={isLoading} class="w-full border-white">
					{#if isLoading}
						<Loader2 class="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 animate-spin text-white" />
					{:else}
						{$_('auth.signup')}
					{/if}
				</Button>
				</form>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-700"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-card-dark text-text-light/60">{$_('auth.orContinueWith')}</span>
					</div>
				</div>

				<a
					class="w-full btn-rounded bg-white hover:bg-gray-100 text-gray-900 flex items-center justify-center gap-2"
					href={GOOGLE_OAUTH_URL}
					rel="external"
				>
					<svg class="w-5 h-5" viewBox="0 0 24 24">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18 v2.84C3.99 20.53 7.7 23 12 23z"/>
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
					</svg>
					{$_('auth.loginWithGoogle')}
				</a>

				<p class="text-center text-sm text-text-light/60">
					Already have an account?
					<a href="/auth/login" class="text-crimson-pulse hover:underline">{$_('auth.login')}</a>
				</p>
			{/if}
		</div>
	</div>
</div>

