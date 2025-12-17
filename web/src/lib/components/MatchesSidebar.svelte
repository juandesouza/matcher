<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	
	/** @type {Array<{ id: string; user: { id: string; name: string; age: number; photos: string[] }; createdAt: string }>} */
	let matches = [];
	let isLoading = true;
	
	$: currentMatchId = $page?.params?.id || null;
	
	/** @type {(() => void) | null} */
	let newMatchHandler = null;
	
	onMount(async () => {
		await loadMatches();
		
		// Listen for new-match events dispatched from the swipe page
		newMatchHandler = () => {
			loadMatches();
		};
		
		if (typeof window !== 'undefined') {
			window.addEventListener('matcher:new-match', newMatchHandler);
		}
	});
	
	onDestroy(() => {
		if (typeof window !== 'undefined' && newMatchHandler) {
			window.removeEventListener('matcher:new-match', newMatchHandler);
		}
	});
	
	async function loadMatches() {
		try {
			isLoading = true;
			const response = await fetch('/api/matches');
			
			// Check content-type before parsing
			const contentType = response.headers.get('content-type');
			if (contentType && contentType.includes('text/html')) {
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
	
	/**
	 * @param {string} matchId
	 */
	function openChat(matchId) {
		goto(`/chat/${matchId}`);
	}
</script>

<div class="h-full bg-card border-r border-gray-300 dark:border-gray-700 flex flex-col overflow-hidden">
	<div class="p-4 border-b border-gray-300 dark:border-gray-700">
		<h2 class="text-xl font-semibold text-text">Your Matches</h2>
	</div>
	
	<div class="flex-1 overflow-y-auto">
		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="text-text text-sm">Loading...</div>
			</div>
		{:else if matches.length === 0}
			<div class="text-center py-12 px-4">
				<p class="text-text/80 text-sm mb-2">No matches yet</p>
				<p class="text-text/60 text-xs">Keep swiping!</p>
			</div>
		{:else}
			<div class="divide-y divide-gray-200 dark:divide-gray-700">
				{#each matches as match}
					<button
						class="w-full p-4 flex items-center gap-3 hover:bg-card-dark/10 transition-colors text-left {currentMatchId === match.id ? 'bg-card-dark/10 border-l-4 border-crimson-pulse' : ''}"
						on:click={() => openChat(match.id)}
					>
						<div class="w-12 h-12 rounded-full overflow-hidden bg-gray-300 flex-shrink-0">
							{#if match.user.photos && match.user.photos[0]}
								<img
									src={match.user.photos[0]}
									alt={match.user.name}
									class="w-full h-full object-cover"
								/>
							{:else}
								<div class="w-full h-full flex items-center justify-center text-gray-500 text-xs">
									?
								</div>
							{/if}
						</div>
						<div class="flex-1 min-w-0">
							<h3 class="text-sm font-semibold text-text truncate">
								{match.user.name}
							</h3>
							<p class="text-text/60 text-xs">{match.user.age} years old</p>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

