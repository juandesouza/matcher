<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { ArrowLeft } from 'lucide-svelte';
	
	// Main screens that should be in navigation history
	const mainScreens = ['/', '/settings', '/profile/edit'];
	
	$: showBackButton = $page?.url?.pathname !== '/';
	
	function goBack() {
		const currentPath = $page?.url?.pathname || '/';
		
		// If we're on a chat page, go directly to home
		if (currentPath.startsWith('/chat/') || currentPath.startsWith('/matches/')) {
			goto('/');
			return;
		}
		
		// If we're on a main screen, navigate to the previous main screen
		// For now, if on settings or profile/edit, go to home
		// If on home, do nothing (button shouldn't show)
		if (currentPath === '/settings' || currentPath === '/profile/edit') {
			goto('/');
			return;
		}
		
		// Fallback: go to home
		goto('/');
	}
</script>

{#if showBackButton}
	<button
		class="fixed top-4 left-4 md:left-[calc(20%+1rem)] z-50 bg-card hover:bg-gray-200 dark:bg-card-dark dark:hover:bg-gray-800 rounded-full p-2 text-text dark:text-text-light shadow-lg border border-gray-300 dark:border-gray-700"
		on:click={goBack}
		aria-label="Go back"
	>
		<ArrowLeft size={24} />
	</button>
{/if}

