<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Navigation from '$lib/components/Navigation.svelte';
	import MatchesSidebar from '$lib/components/MatchesSidebar.svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { theme } from '$lib/stores/theme';
	import { Loader2 } from 'lucide-svelte';
	import '../lib/i18n';

	export let data;
	let hideNav = false;
	let isAppLoading = true;

	const authPaths = ['/auth/login', '/auth/signup', '/terms', '/privacy', '/subscribe', '/setup'];
	const chatPaths = ['/chat/'];

	$: hideNav = authPaths.some((path) => $page?.url?.pathname?.startsWith(path));
	$: isChatPage = chatPaths.some((path) => $page?.url?.pathname?.startsWith(path));
	// Show sidebar on desktop for all authenticated pages (including chat - chat shows on right side)
	$: showMatchesSidebar = !hideNav && data?.user;
	$: void data;

	onMount(() => {
		theme.init();
		
		// Unregister any existing service workers (from previous PWA setup)
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.getRegistrations().then((registrations) => {
				if (registrations.length > 0) {
					console.log(`[Cleanup] Found ${registrations.length} service worker(s), unregistering...`);
					registrations.forEach((registration) => {
						registration.unregister().then((success) => {
							if (success) {
								console.log('[Cleanup] Service worker unregistered');
							}
						});
					});
					// Clear all caches
					if ('caches' in window) {
						caches.keys().then((cacheNames) => {
							cacheNames.forEach((cacheName) => {
								caches.delete(cacheName);
							});
						});
					}
				}
			});
		}
		
		// Hide loading spinner after a short delay to allow hydration
		setTimeout(() => {
			isAppLoading = false;
		}, 100);
	});
</script>

<svelte:head>
	<title>Matcher</title>
	<meta name="description" content="Find your perfect match with Matcher" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<meta name="theme-color" content="#C62828" />
	<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤️</text></svg>" />
	<!-- PWA manifest removed - can be re-enabled later if needed -->
</svelte:head>

{#if isAppLoading}
	<div class="min-h-screen bg-bg text-text flex items-center justify-center">
		<Loader2 class="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 animate-spin text-crimson-pulse" />
	</div>
{:else}
	<!-- Desktop: Split screen with matches sidebar -->
	<div class="hidden md:flex h-screen bg-bg text-text overflow-hidden">
		{#if showMatchesSidebar}
			<!-- Matches Sidebar (20% width) -->
			<div class="w-1/5 flex-shrink-0 h-full">
				<MatchesSidebar />
			</div>
		{/if}
		
		<!-- Main Content (80% width or 100% if no sidebar) -->
		<div class="flex-1 overflow-y-auto md:overflow-visible h-full relative {showMatchesSidebar ? '' : 'w-full'}">
			<BackButton />
			<div class="pb-19 min-h-full md:pb-0 md:h-full md:overflow-visible">
				<slot />
			</div>
			<!-- Desktop Navigation - fixed at bottom of right side -->
			{#if !hideNav}
				<div class="fixed bottom-0 {showMatchesSidebar ? 'left-[20%]' : 'left-0'} right-0 z-40 bg-card-dark">
					<Navigation />
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Mobile/Tablet: Single column with bottom nav -->
	<div class="md:hidden min-h-screen bg-bg text-text pb-19">
		<BackButton />
		<slot />
	</div>

	<!-- Mobile Navigation -->
	{#if !hideNav}
		<div class="md:hidden">
			<Navigation />
		</div>
	{/if}
{/if}
