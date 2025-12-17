<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { MessageCircle } from 'lucide-svelte';
	
	let matches = [];
	let isLoading = true;
	
	onMount(async () => {
		await loadMatches();
	});
	
	async function loadMatches() {
		try {
			isLoading = true;
			const response = await fetch('/api/matches');
			
			// Check content-type before parsing
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('text/html')) {
				// It's a redirect or error page, not JSON
				console.warn('Received HTML response where JSON was expected');
				if (response.status === 401 || response.status === 302) {
					window.location.href = '/auth/login';
					return;
				}
				return;
			}
			
			if (response.ok) {
				const data = await response.json();
				matches = data.matches || [];
			} else if (response.status === 401) {
				window.location.href = '/auth/login';
			}
		} catch (error) {
			console.error('Failed to load matches:', error);
		} finally {
			isLoading = false;
		}
	}
	
	function openChat(matchId) {
		goto(`/chat/${matchId}`);
	}
</script>

<svelte:head>
	<title>Chats - Matcher</title>
</svelte:head>

<div class="min-h-screen bg-bg py-8 px-4">
	<div class="max-w-2xl mx-auto">
		<h1 class="text-3xl font-semibold text-text-light mb-6">Your Matches</h1>
		
		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="text-text-light">Loading matches...</div>
			</div>
		{:else if matches.length === 0}
			<div class="text-center py-12">
				<p class="text-text-light/80 text-lg mb-4">No matches yet</p>
				<p class="text-text-light/60">Keep swiping to find your match!</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each matches as match}
					<div 
						class="card p-4 flex items-center gap-4 hover:bg-opacity-90 transition-colors cursor-pointer"
						on:click={() => openChat(match.id)}
					>
						<div class="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
							{#if match.user.photos && match.user.photos[0]}
								<img
									src={match.user.photos[0]}
									alt={match.user.name}
									class="w-full h-full object-cover"
								/>
							{:else}
								<div class="w-full h-full flex items-center justify-center text-gray-400">
									?
								</div>
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<h3 class="text-lg font-semibold text-text-light truncate">
								{match.user.name}
							</h3>
							<p class="text-text-light/60 text-sm">{match.user.age} years old</p>
						</div>
						<button
							class="btn-circle bg-crimson-pulse text-white"
							on:click|stopPropagation={() => openChat(match.id)}
							aria-label="Open chat"
						>
							<MessageCircle size={20} />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

