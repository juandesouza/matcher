<script>
	import { onMount } from 'svelte';
	import SwipeCard from '$lib/components/SwipeCard.svelte';
	import AdSense from '$lib/components/AdSense.svelte';
	import { goto } from '$app/navigation';
	import { _ } from 'svelte-i18n';
	import { Loader2, X, Heart } from 'lucide-svelte';
	
	export let data;
	/** @type {Array<{ id: string; name: string; age: number; photos: string[]; bio: string }>} */
	let cards = [];
	let currentCardIndex = 0;
	let isLoading = true;
	// Controls whether to show an interstitial ad between cards (for non-subscribed users)
	let showAd = false;
	let isSubscribed = false;
	$: void data;
	
	// Debug: Log when cards change
	$: {
		if (cards.length > 0) {
			console.log('[Cards] Cards array updated:', cards.length, 'cards, currentIndex:', currentCardIndex);
		} else {
			console.log('[Cards] Cards array is empty');
		}
	}
	
	onMount(async () => {
		// Check if user is authenticated (should be handled by server, but double-check)
		if (!data.user) {
			goto('/auth/login');
			return;
		}
		
		// Check if user has completed profile
		const user = data.user;
		const profileComplete = user.age && user.gender && user.bio && user.photos?.length > 0;
		if (!profileComplete) {
			goto('/setup');
			return;
		}
		
		// Get user location and update it
		await updateUserLocation();
		
		// Check subscription status
		if (user?.isSubscribed) {
			isSubscribed = true;
		} else if (user) {
			// Only fetch settings if user is authenticated
			try {
				const settingsResponse = await fetch('/api/settings');
				if (settingsResponse.ok) {
					const contentType = settingsResponse.headers.get('content-type');
					if (contentType && contentType.includes('application/json')) {
						const settings = await settingsResponse.json();
						isSubscribed = settings.isSubscribed || false;
					}
				}
			} catch (error) {
				console.error('Failed to fetch settings:', error);
			}
		}
		
		// Load user cards
		await loadCards();
		
		// Preload more cards if we have few left (ensure we have at least 2 cards for stacking)
		if (cards.length < 2) {
			await loadCards();
		}
		
		// Try to get at least 2 cards, but limit attempts to prevent infinite loop
		let attempts = 0;
		const maxAttempts = 5;
		while (cards.length < 2 && attempts < maxAttempts) {
			const previousCount = cards.length;
			await loadCards();
			// If no new cards were added, stop trying
			if (cards.length === previousCount) {
				console.log('[Cards] No new cards loaded, stopping attempts');
				break;
			}
			attempts++;
		}
		
		console.log('[Cards] Final card count after loading:', cards.length);
	});
	
	async function updateUserLocation() {
		if (!navigator.geolocation || !data.user) {
			console.warn('Geolocation not supported or user not authenticated');
			return;
		}
		
		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const location = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				
				// Update user location in database
				try {
					const response = await fetch('/api/location', {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(location)
					});
					if (!response.ok) {
						console.error('Failed to update location:', response.status);
					}
				} catch (error) {
					console.error('Location update error:', error);
				}
			},
			(error) => {
				console.error('Geolocation error:', error);
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 60000 // Cache for 1 minute
			}
		);
	}
	
	async function loadCards() {
		if (!data.user) {
			console.warn('[Cards] No user data available');
			isLoading = false;
			return;
		}
		
		try {
			isLoading = true;
			console.log('[Cards] Fetching cards from API...');
			const response = await fetch('/api/users/cards');
			console.log('[Cards] API response status:', response.status, response.statusText);
			
			if (response.ok) {
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('application/json')) {
					const data = await response.json();
					const newCards = (data.cards || []);
					console.log('[Cards] Received', newCards.length, 'cards from API');
					
					// Only append cards that aren't already in the array (avoid duplicates)
					/** @type {Set<string>} */
					// @ts-ignore - runtime cards have id
					const existingIds = new Set(cards.map((c) => c.id));
					// @ts-ignore - runtime cards have id
					const uniqueNewCards = newCards.filter((c) => !existingIds.has(c.id));
					console.log('[Cards] Adding', uniqueNewCards.length, 'new unique cards');
					cards = [...cards, ...uniqueNewCards]; // Append new cards instead of replacing
					console.log('[Cards] Total cards now:', cards.length);
				} else {
					console.error('[Cards] Expected JSON but got:', contentType);
					// If not authenticated, redirect to login
					if (response.status === 401 || response.status === 302) {
						goto('/auth/login');
					}
				}
			} else {
				console.error('[Cards] API request failed with status:', response.status);
				const errorText = await response.text().catch(() => '');
				console.error('[Cards] Error response:', errorText);
				
				if (response.status === 401 || response.status === 302) {
					// Not authenticated, redirect to login
					goto('/auth/login');
				}
			}
		} catch (error) {
			console.error('[Cards] Failed to load cards:', error);
		} finally {
			isLoading = false;
		}
	}
	
	function handleSwipeLeft() {
		handleSwipe('left');
	}
	
	function handleSwipeRight() {
		handleSwipe('right');
	}
	
	/**
	 * @param {'left' | 'right'} direction
	 */
	async function handleSwipe(direction) {
		// When an interstitial ad is visible, swipes act on the ad instead of a user card
		if (showAd && !isSubscribed) {
			if (direction === 'left') {
				// Dismiss ad
				showAd = false;
			} else {
				// Like → go to subscribe page
				goto('/subscribe');
			}
			return;
		}
		
		if (cards.length === 0 || currentCardIndex >= cards.length) return;
		
		const currentCard = cards[currentCardIndex];
		
		// Send swipe action to API
		const swipeResponse = await fetch('/api/swipes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				targetUserId: currentCard.id,
				action: direction === 'right' ? 'like' : 'dislike'
			})
		});
		
		if (swipeResponse.ok) {
			const swipeData = await swipeResponse.json();
			
			// Check if it's a match (API returns this now)
			if (swipeData.isMatch && swipeData.matchId) {
				// Notify other parts of the app (e.g. sidebar) to refresh matches
				if (typeof window !== 'undefined') {
					window.dispatchEvent(new CustomEvent('matcher:new-match'));
				}
				
				// Show match screen immediately
				goto(`/matches/${swipeData.matchId}`);
				return; // Don't move to next card if there's a match
			}

			// For non-subscribed users, show an interstitial ad after every swipe
			if (!isSubscribed) {
				showAd = true;
			}
		}
		
		// Move to next card
		currentCardIndex++;
		
		// Always ensure next card is loaded (preload when we're on the last card or when next doesn't exist)
		if (currentCardIndex + 1 >= cards.length) {
			await loadCards();
		}
		
		// If still no next card after loading, try loading again
		if (currentCardIndex + 1 >= cards.length) {
			await loadCards();
		}
	}
	
	function handleLike() {
		// Visual feedback
	}
	
	function handleDislike() {
		// Visual feedback
	}
	
	async function handleAdClick() {
		// When user clicks heart on ad, open subscribe page
		// In the future, this could open the actual ad link if available
		goto('/subscribe');
	}
</script>

<svelte:head>
	<title>{$_('app.name')} - {$_('home.title')}</title>
</svelte:head>

<div class="h-screen bg-bg py-8 px-4 md:py-4 md:pb-0 overflow-hidden md:overflow-visible flex flex-col md:h-full">
	<div class="max-w-md mx-auto md:max-w-2xl flex-1 flex flex-col justify-center md:justify-start md:pt-4 md:overflow-visible md:h-full">
		{#if isLoading}
			<div class="flex items-center justify-center">
				<Loader2 class="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 animate-spin text-crimson-pulse" />
			</div>
		{:else if cards.length === 0}
			<div class="flex flex-col items-center justify-center text-center">
				<h2 class="text-2xl font-semibold text-text-light mb-4">{$_('home.noMoreCards')}</h2>
				<p class="text-text-light/80 mb-6">{$_('home.checkBackLater')}</p>
				<button
					class="btn-rounded bg-crimson-pulse text-white px-6 py-3"
					on:click={loadCards}
				>
					{$_('common.refresh')}
				</button>
			</div>
		{:else if currentCardIndex < cards.length}
			{#if showAd && !isSubscribed}
				<!-- Interstitial ad shown using the same SwipeCard layout -->
				<div class="relative card-container">
					<SwipeCard
						user={{
							id: '__ad__',
							name: 'Sponsored',
							age: 0,
							photos: [],
							bio: 'Upgrade to remove all ads and enjoy an uninterrupted Matcher experience.'
						}}
						onSwipeLeft={() => (showAd = false)}
						onSwipeRight={async () => {
							// Open ad link or subscribe page
							await handleAdClick();
						}}
						onLike={async () => {
							// Open ad link or subscribe page
							await handleAdClick();
						}}
						onDislike={() => (showAd = false)}
					/>
				</div>

				<!-- Desktop like/dislike buttons for ad: outside card-container, below card -->
				<div class="hidden md:flex desktop-like-buttons">
					<button
						class="btn-circle bg-white hover:bg-gray-100 text-dislike-gray shadow-lg"
						on:click={() => (showAd = false)}
						aria-label="Dismiss ad"
					>
						<X size={40} class="w-10 h-10" />
					</button>
					<button
						class="btn-circle bg-match-green hover:bg-green-500 text-white shadow-lg"
						on:click={async () => {
							// Open ad link or subscribe page
							await handleAdClick();
						}}
						aria-label="Open ad"
					>
						<Heart size={40} class="w-10 h-10" />
					</button>
				</div>
				
				<div class="mt-3 flex flex-col items-center gap-2 md:hidden">
					<button
						class="btn-rounded bg-crimson-pulse text-white px-6 py-3"
						on:click={async () => {
							await handleAdClick();
						}}
					>
						Subscribe for removing ads
					</button>
					<button
						class="btn-rounded bg-card-dark border border-gray-600 text-text-light px-6 py-3"
						on:click={() => (showAd = false)}
					>
						Continue swiping
					</button>
				</div>
			{:else}
				<!-- Stack cards - show current and next one behind it -->
				<div class="relative card-container">
					{#if currentCardIndex + 1 < cards.length}
						<!-- Next card (behind) -->
						<div class="absolute inset-0 transform scale-95 opacity-50 -z-10">
							<SwipeCard
								user={cards[currentCardIndex + 1]}
								onSwipeLeft={() => {}}
								onSwipeRight={() => {}}
								onLike={() => {}}
								onDislike={() => {}}
							/>
						</div>
					{/if}
					
					<!-- Current card (front) -->
					<SwipeCard
						user={cards[currentCardIndex]}
						onSwipeLeft={handleSwipeLeft}
						onSwipeRight={handleSwipeRight}
						onLike={handleLike}
						onDislike={handleDislike}
					/>
				</div>

				<!-- Desktop like/dislike buttons: outside card-container, below card -->
				<div class="hidden md:flex desktop-like-buttons">
					<button
						class="btn-circle bg-white hover:bg-gray-100 text-dislike-gray shadow-lg"
						on:click={handleSwipeLeft}
						aria-label="Dislike"
					>
						<X size={40} class="w-10 h-10" />
					</button>
					<button
						class="btn-circle bg-match-green hover:bg-green-500 text-white shadow-lg"
						on:click={handleSwipeRight}
						aria-label="Like"
					>
						<Heart size={40} class="w-10 h-10" />
					</button>
				</div>
			{/if}
		{:else}
			<div class="flex flex-col items-center justify-center text-center">
				<h2 class="text-2xl font-semibold text-text-light mb-4">{$_('home.allCaughtUp')}</h2>
				<p class="text-text-light/80 mb-6">{$_('home.checkBackLaterShort')}</p>
			</div>
		{/if}
	</div>
</div>
