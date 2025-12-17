<script>
	import { onMount, onDestroy } from 'svelte';
	
	export let slot = 'auto';
	export let format = 'auto';
	export let responsive = true;
	export let className = '';

	let adElement = null;
	let publisherId = '';
	let observer = null;
	
	onMount(async () => {
		try {
			// Load AdSense config from backend
			const configResponse = await fetch('/api/adsense');
			if (!configResponse.ok) {
				console.warn('[AdSense] Config request failed with status', configResponse.status);
				return;
			}
			const config = await import.meta.env.DEV ? await configResponse.json() : await configResponse.json();
			console.log('[AdSense] Config from /api/adsense:', config);

			publisherId = config.publisherId;
			
			if (!publisherId || !config.enabled) {
				console.warn('[AdSense] Disabled or missing publisherId, skipping ad render.', { publisherId, enabled: config.enabled });
				return;
			}
			
			// Load AdSense script once
			if (!window.adsbygoogle) {
				const script = document.createElement('script');
				script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
				script.async = true;
				script.crossOrigin = 'anonymous';
				script.onload = () => {
					console.log('[AdSense] Script loaded');
					if (adElement) {
						try {
							(window.adsbygoogle = window.adsbygoogle || []).push({});
							console.log('[AdSense] adsbygoogle.push() called');
						} catch (e) {
							console.error('[AdSense] push error:', e);
						}
					}
				};
				script.onerror = (e) => {
					console.error('[AdSense] Failed to load script', e);
				};
				document.head.appendChild(script);
			} else if (adElement) {
				try {
					(window.adsbygoogle = window.adsbygoogle || []).push({});
					console.log('[AdSense] adsbygoogle.push() called (script already present)');
				} catch (e) {
					console.error('[AdSense] push error (existing script):', e);
				}
			}

			// Observe ad element for injected iframes/content to confirm fill activity
			if (adElement && 'MutationObserver' in window) {
				observer = new MutationObserver((mutations) => {
					for (const m of mutations) {
						if (m.addedNodes && m.addedNodes.length > 0) {
							console.log('[AdSense] Ad content updated:', m);
							break;
						}
					}
				});
				observer.observe(adElement, { childList: true, subtree: true });
			}
		} catch (err) {
			console.error('[AdSense] Initialization error:', err);
		}
	});

	onDestroy(() => {
		if (observer) {
			observer.disconnect();
			observer = null;
		}
	});
</script>

{#if publisherId}
	<ins
		bind:this={adElement}
		class="adsbygoogle block {className}"
		style="display:block"
		data-ad-client={publisherId}
		data-ad-slot={slot}
		data-ad-format={format}
		data-full-width-responsive={responsive}
	></ins>
{:else}
	<div class="w-full h-32 bg-gray-800 rounded-lg flex items-center justify-center {className}">
		<p class="text-text-light/60 text-sm">Advertisement</p>
	</div>
{/if}

