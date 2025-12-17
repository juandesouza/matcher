<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { theme } from '$lib/stores/theme';
	import { localeStore } from '$lib/stores/locale';
	import { locale, _ } from 'svelte-i18n';
	import { Moon, Sun, DollarSign, LogOut, Globe, User } from 'lucide-svelte';
	import Button from '$lib/components/Button.svelte';
	import { goto } from '$app/navigation';
	
	let ageRange = { min: 18, max: 99 };
	let distanceRange = 50; // km
	let currentTheme = 'dark';
	let isSubscribed = false;
	let selectedLocale = 'en';
	let isInitialLoad = true; // Track initial load to prevent auto-save on mount
	
	const localeNames = {
		en: 'English',
		pt: 'Português',
		es: 'Español',
		fr: 'Français',
		it: 'Italiano'
	};
	
	/**
	 * @param {string} locale
	 */
	function getLocaleName(locale) {
		// @ts-ignore - locale is a valid key from supportedLocales
		return localeNames[locale] || locale;
	}
	
	onMount(async () => {
		// Load user settings
		try {
			const response = await fetch('/api/settings');
			
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
				ageRange = data.ageRange || { min: 18, max: 99 };
				distanceRange = data.distanceRange || 50;
				isSubscribed = data.isSubscribed || false;
				selectedLocale = data.locale || localeStore.get();
				currentTheme = data.theme || 'dark';
				// Initialize theme store with saved theme
				theme.set(currentTheme);
			} else if (response.status === 401) {
				window.location.href = '/auth/login';
			}
		} catch (error) {
			console.error('Failed to load settings:', error);
		} finally {
			// Mark initial load as complete after a short delay
			setTimeout(() => {
				isInitialLoad = false;
			}, 1000);
		}
		
		// Get current locale
		locale.subscribe((l) => {
			selectedLocale = l || localeStore.get();
		});
		
		theme.subscribe((t) => {
			currentTheme = t;
			// Force update to ensure theme is applied
			if (browser) {
				const html = document.documentElement;
				html.setAttribute('data-theme', t);
				if (t === 'dark') {
					html.classList.add('dark');
				} else {
					html.classList.remove('dark');
				}
			}
		});
	});
	
	// Auto-save function (debounced)
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let saveTimeout;
	async function autoSaveSettings() {
		// Don't auto-save during initial load
		if (isInitialLoad) return;
		
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			try {
				const response = await fetch('/api/settings', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						ageRange,
						distanceRange,
						locale: selectedLocale,
						theme: currentTheme
					})
				});
				
				// Check content-type before parsing
				const contentType = response.headers.get('content-type');
				if (contentType && contentType.includes('text/html')) {
					if (response.status === 401 || response.status === 302) {
						window.location.href = '/auth/login';
						return;
					}
					return;
				}
				
				if (!response.ok && response.status !== 401) {
					console.error('Failed to auto-save settings');
				}
			} catch (error) {
				console.error('Failed to auto-save settings:', error);
			}
		}, 500); // Debounce: save 500ms after last change
	}
	
	/**
	 * @param {string} newLocale
	 */
	function handleLocaleChange(newLocale) {
		selectedLocale = newLocale;
		localeStore.set(newLocale);
		locale.set(newLocale);
		autoSaveSettings();
	}
	
	function toggleTheme() {
		theme.toggle();
		// Save theme to backend
		autoSaveSettings();
	}
	
	// Auto-save when ageRange changes
	$: if (!isInitialLoad && ageRange && ageRange.min && ageRange.max) {
		autoSaveSettings();
	}
	
	// Auto-save when distanceRange changes
	$: if (!isInitialLoad && distanceRange !== undefined) {
		autoSaveSettings();
	}
	
	async function handleSubscribe() {
		// Create Stripe checkout session and redirect to payment
		try {
			const response = await fetch('/api/subscribe/create-checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			
			if (!response.ok) {
				alert('Failed to create checkout session. Please try again.');
				return;
			}
			
			const { sessionId, error: sessionError } = await response.json();
			
			if (sessionError) {
				alert(sessionError);
				return;
			}
			
			// Load Stripe and redirect to checkout
			const { loadStripe } = await import('@stripe/stripe-js');
			const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
			
			if (!STRIPE_PUBLISHABLE_KEY) {
				alert('Stripe not configured. Please contact support.');
				return;
			}
			
			const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
			if (!stripe) {
				alert('Failed to load Stripe. Please try again.');
				return;
			}
			
			const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
			
			if (stripeError) {
				alert(stripeError.message);
			}
		} catch (error) {
			console.error('Subscription error:', error);
			alert('Failed to start checkout. Please try again.');
		}
	}
	
	async function handleLogout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		window.location.href = '/auth/login';
	}
</script>

<svelte:head>
	<title>{$_('settings.title')} - Matcher</title>
</svelte:head>

<div class="h-screen bg-bg py-8 px-4 md:py-4 md:pb-20 overflow-y-auto md:overflow-y-auto md:h-full">
	<div class="max-w-2xl mx-auto">
		<h1 class="text-3xl font-semibold text-text-light mb-8 pl-12 md:pl-0">{$_('settings.title')}</h1>
		
		<div class="space-y-6">
			<!-- Edit Profile -->
			<div class="card">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-xl font-semibold text-text-light mb-1">Profile</h2>
						<p class="text-text-light/60 text-sm">Edit your profile information</p>
					</div>
					<button
						class="btn-rounded bg-crimson-pulse text-white px-6 py-3 flex items-center gap-2"
						on:click={() => goto('/profile/edit')}
					>
						<User size={20} />
						Edit Profile
					</button>
				</div>
			</div>
			
			<!-- Theme Toggle -->
			<div class="card">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-xl font-semibold text-text-light mb-1">{$_('settings.theme')}</h2>
						<p class="text-text-light/60 text-sm">{$_('settings.themeDescription')}</p>
					</div>
					<button
						class="btn-circle bg-gray-200 hover:bg-gray-300 dark:bg-card-dark dark:hover:bg-gray-700 text-gray-800 dark:text-text-light"
						on:click={toggleTheme}
						aria-label="Toggle theme"
					>
						{#if currentTheme === 'dark'}
							<Sun size={24} />
						{:else}
							<Moon size={24} />
						{/if}
					</button>
				</div>
			</div>
			
			<!-- Age Range -->
			<div class="card">
				<h2 class="text-xl font-semibold text-text-light mb-4">{$_('settings.ageRange')}</h2>
				<div class="flex items-center gap-4">
					<div class="flex-1">
						<label class="block text-sm text-text-light/80 mb-2" for="min-age-input">{$_('settings.minAge')}</label>
						<input
							id="min-age-input"
							type="number"
							bind:value={ageRange.min}
							min="18"
							max="99"
							class="w-full bg-card text-text px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
						/>
					</div>
					<div class="flex-1">
						<label class="block text-sm text-text-light/80 mb-2" for="max-age-input">{$_('settings.maxAge')}</label>
						<input
							id="max-age-input"
							type="number"
							bind:value={ageRange.max}
							min="18"
							max="99"
							class="w-full bg-card text-text px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
						/>
					</div>
				</div>
			</div>
			
			<!-- Distance Range -->
			<div class="card">
				<h2 class="text-xl font-semibold text-text-light mb-4">{$_('settings.distanceRange')}</h2>
				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="distance-range-input">
						{$_('settings.maxDistance', { values: { distance: distanceRange } })}
					</label>
					<input
						id="distance-range-input"
						type="range"
						bind:value={distanceRange}
						min="1"
						max="100"
						class="w-full"
					/>
				</div>
			</div>
			
			<!-- Language -->
			<div class="card">
				<div class="flex items-center justify-between mb-4">
					<div>
						<label for="language-select" class="text-xl font-semibold text-text-light mb-1 block">
							{$_('settings.language')}
						</label>
						<p class="text-text-light/60 text-sm">{$_('settings.languageDescription')}</p>
					</div>
					<Globe class="text-text-light/60" size={24} aria-hidden="true" />
				</div>
				<select
					id="language-select"
					bind:value={selectedLocale}
					on:change={(e) => {
						const target = e.target;
						if (target instanceof HTMLSelectElement) {
							handleLocaleChange(target.value);
						}
					}}
					class="w-full bg-card text-text px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
				>
					{#each localeStore.supportedLocales as loc}
						<option value={loc}>{getLocaleName(loc)}</option>
					{/each}
				</select>
			</div>
			
			<!-- Subscription -->
			<div class="card">
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-xl font-semibold text-text-light mb-1">{$_('settings.removeAds')}</h2>
						<p class="text-text-light/60 text-sm">
							{#if isSubscribed}
								{$_('settings.subscribed')}
							{:else}
								{$_('settings.notSubscribed')}
							{/if}
						</p>
					</div>
					{#if !isSubscribed}
						<button
							class="btn-rounded bg-crimson-pulse text-white px-6 py-3 flex items-center gap-2"
							on:click={handleSubscribe}
						>
							<DollarSign size={20} />
							{$_('settings.subscribe')}
						</button>
					{/if}
				</div>
			</div>
			
			<!-- Logout -->
			<button
				class="btn-rounded bg-red-600 hover:bg-red-700 text-white px-6 py-3 w-full flex items-center justify-center gap-2"
				on:click={handleLogout}
			>
				<LogOut size={20} />
				{$_('auth.logout')}
			</button>
		</div>
	</div>
</div>

