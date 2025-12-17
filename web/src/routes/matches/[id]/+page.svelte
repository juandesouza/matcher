<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Heart } from 'lucide-svelte';
	
	export let data;
	$: void data;
	
	let matchData = null;
	let isLoading = true;
	let lastLoadedMatchId;

	$: {
		const matchId = $page?.params?.id;
		if (matchId && matchId !== lastLoadedMatchId) {
			lastLoadedMatchId = matchId;
			loadMatch(matchId);
		}
	}
	
	async function loadMatch(matchId) {
		try {
			isLoading = true;
			const response = await fetch(`/api/matches/${matchId}`);
			if (response.ok) {
				matchData = await response.json();
			}
		} catch (error) {
			console.error('Failed to load match:', error);
		} finally {
			isLoading = false;
		}
	}
	
	function openChat() {
		if (matchData) {
			goto(`/chat/${matchData.id}`);
		}
	}
</script>

<svelte:head>
	<title>It's a Match! - Matcher</title>
</svelte:head>

<div class="min-h-screen bg-bg-dark flex items-center justify-center p-4">
	{#if isLoading}
		<div class="text-text-light">Loading...</div>
	{:else if matchData}
		<div class="text-center max-w-md">
			<!-- Match Animation -->
			<div class="mb-8">
				<div class="relative inline-block">
					<Heart
						size={120}
						class="text-match-green animate-pulse mx-auto"
						fill="currentColor"
					/>
				</div>
			</div>
			
			<h1 class="text-4xl font-bold text-text-light mb-4">It's a Match!</h1>
			<p class="text-xl text-text-light/80 mb-8">
				You and {matchData.user.name} liked each other
			</p>
			
			<!-- User Photos Side by Side with Heart -->
			<div class="flex justify-center items-center gap-4 mb-8">
				<!-- Current User Photo -->
				{#if data.user?.photos && data.user.photos[0]}
					<div class="w-32 h-32 rounded-full overflow-hidden border-4 border-match-green">
						<img
							src={data.user.photos[0]}
							alt={data.user.name}
							class="w-full h-full object-cover"
						/>
					</div>
				{/if}
				
				<!-- Heart Icon -->
				<Heart
					size={48}
					class="text-match-green animate-pulse"
					fill="currentColor"
				/>
				
				<!-- Matched User Photo -->
				{#if matchData.user.photos && matchData.user.photos[0]}
					<div class="w-32 h-32 rounded-full overflow-hidden border-4 border-match-green">
						<img
							src={matchData.user.photos[0]}
							alt={matchData.user.name}
							class="w-full h-full object-cover"
						/>
					</div>
				{/if}
			</div>
			
			<!-- Action Button -->
			<button
				class="btn-rounded bg-crimson-pulse text-white px-8 py-4 text-lg font-semibold w-full"
				on:click={openChat}
			>
				Send a Message
			</button>
			
			<button
				class="btn-rounded bg-transparent border border-gray-600 text-text-light px-8 py-4 text-lg mt-4 w-full"
				on:click={() => goto('/')}
			>
				Keep Swiping
			</button>
		</div>
	{:else}
		<div class="text-center">
			<p class="text-text-light/80">Match not found</p>
			<button
				class="btn-rounded bg-crimson-pulse text-white px-6 py-3 mt-4"
				onclick={() => goto('/')}
			>
				Go Home
			</button>
		</div>
	{/if}
</div>

