<script>
	import { page } from '$app/stores';
	import { Home, MessageCircle, Settings } from 'lucide-svelte';
	import { _ } from 'svelte-i18n';
	
	// On desktop, hide chat button (matches are in sidebar)
	// On mobile/tablet, show all buttons
	const navItems = [
		{ path: '/', icon: Home, labelKey: 'navigation.discover' },
		{ path: '/matches', icon: MessageCircle, labelKey: 'navigation.chat', mobileOnly: true },
		{ path: '/settings', icon: Settings, labelKey: 'navigation.settings' }
	];
</script>

<nav class="fixed bottom-0 left-0 right-0 bg-card border-t border-gray-300 dark:border-gray-700 z-50 md:relative md:bottom-auto md:left-auto md:right-auto">
	<div class="flex justify-center items-center h-19 md:h-19 gap-6 px-4">
		{#each navItems as item}
			{#if !item.mobileOnly}
				<a
					href={item.path}
					class={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${$page?.url?.pathname === item.path ? 'text-crimson-pulse' : 'text-text/70 hover:text-text'}`}
					aria-label={$_(item.labelKey)}
				>
					<svelte:component this={item.icon} size={24} />
					<span class="text-xs md:text-sm">{$_(item.labelKey)}</span>
				</a>
			{:else}
				<!-- Mobile only -->
				<a
					href={item.path}
					class="md:hidden flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${$page?.url?.pathname === item.path ? 'text-crimson-pulse' : 'text-text/70 hover:text-text'}"
					aria-label={$_(item.labelKey)}
				>
					<svelte:component this={item.icon} size={24} />
					<span class="text-xs">{$_(item.labelKey)}</span>
				</a>
			{/if}
		{/each}
	</div>
</nav>

