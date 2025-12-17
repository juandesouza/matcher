<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/Button.svelte';
	import { Lock, Loader2, Eye, EyeOff } from 'lucide-svelte';
	
	let password = '';
	let confirmPassword = '';
	let showPassword = false;
	let showConfirmPassword = false;
	let isLoading = false;
	let error = '';
	
	$: token = $page.url.searchParams.get('token') || '';
	
	/**
	 * @param {SubmitEvent} e
	 */
	async function handleResetPassword(e) {
		e.preventDefault();
		
		if (!password.trim()) {
			error = 'Password is required';
			return;
		}
		if (password.length < 6) {
			error = 'Password must be at least 6 characters';
			return;
		}
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}
		
		if (!token) {
			error = 'Invalid or missing reset token';
			return;
		}
		
		isLoading = true;
		error = '';
		
		try {
			const response = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, password })
			});
			
			const data = await response.json();
			
			if (response.ok) {
				alert('Password reset successfully! You can now login with your new password.');
				goto('/auth/login');
			} else {
				error = data.error || 'Failed to reset password';
			}
		} catch (err) {
			console.error('Reset password error:', err);
			error = 'Network error. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Reset Password - Matcher</title>
</svelte:head>

<div class="min-h-screen bg-bg-dark flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-text-light mb-2">Reset Password</h1>
			<p class="text-text-light/60">Enter your new password below.</p>
		</div>
		
		<div class="card p-6">
			<form on:submit={handleResetPassword} class="space-y-4">
				{#if error}
					<div class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
						{error}
					</div>
				{/if}
				
				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="password-input">New Password</label>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light/60" size={20} />
						{#if showPassword}
							<input
								id="password-input"
								type="text"
								bind:value={password}
								required
								class="w-full bg-gray-800 text-text-light px-4 py-3 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
								placeholder="••••••••"
							/>
						{:else}
							<input
								id="password-input"
								type="password"
								bind:value={password}
								required
								class="w-full bg-gray-800 text-text-light px-4 py-3 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
								placeholder="••••••••"
							/>
						{/if}
						<button
							type="button"
							on:click={() => showPassword = !showPassword}
							class="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light/60 hover:text-text-light transition-colors"
						>
							{#if showPassword}
								<EyeOff size={20} />
							{:else}
								<Eye size={20} />
							{/if}
						</button>
					</div>
				</div>
				
				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="confirm-password-input">Confirm New Password</label>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light/60" size={20} />
						{#if showConfirmPassword}
							<input
								id="confirm-password-input"
								type="text"
								bind:value={confirmPassword}
								required
								class="w-full bg-gray-800 text-text-light px-4 py-3 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
								placeholder="••••••••"
							/>
						{:else}
							<input
								id="confirm-password-input"
								type="password"
								bind:value={confirmPassword}
								required
								class="w-full bg-gray-800 text-text-light px-4 py-3 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
								placeholder="••••••••"
							/>
						{/if}
						<button
							type="button"
							on:click={() => showConfirmPassword = !showConfirmPassword}
							class="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light/60 hover:text-text-light transition-colors"
						>
							{#if showConfirmPassword}
								<EyeOff size={20} />
							{:else}
								<Eye size={20} />
							{/if}
						</button>
					</div>
				</div>
				
				<Button type="submit" disabled={isLoading} class="w-full border-white">
					{#if isLoading}
						<Loader2 class="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 animate-spin text-white" />
					{:else}
						Reset Password
					{/if}
				</Button>
			</form>
		</div>
	</div>
</div>

