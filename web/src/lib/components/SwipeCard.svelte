<script>
	import { onDestroy } from 'svelte';
	import { Heart, X } from 'lucide-svelte';
	import AdSense from '$lib/components/AdSense.svelte';
	
	export let user = {};
	export let onSwipeLeft = () => {};
	export let onSwipeRight = () => {};
	export let onLike = () => {};
	export let onDislike = () => {};

	const SWIPE_THRESHOLD = 100;
	const ROTATION_FACTOR = 0.1;

let cardElement;
let cardStyle = '';
	let startX = 0;
	let startY = 0;
	let currentX = 0;
	let currentY = 0;
	let rotation = 0;
	let opacity = 1;
	let isDragging = false;
	let activePointerId = null;
	let currentPhotoIndex = 0;
	let lastUserId;
let resetTimer;
let isDesktop = false;

// Treat a card with a special id as an ad card
$: isAd = user && user.id === '__ad__';

	// Check if desktop on mount
	if (typeof window !== 'undefined') {
		const checkDesktop = () => {
			isDesktop = window.innerWidth >= 768;
		};
		checkDesktop();
		window.addEventListener('resize', checkDesktop);
	}

	$: scaleValue = isDesktop ? 0.82 : 1;
	$: cardStyle = `transform: translate(${currentX}px, ${currentY}px) rotate(${rotation}deg) scale(${scaleValue}); opacity: ${opacity}; transition: ${
		isDragging ? 'none' : 'transform 300ms ease-out, opacity 300ms ease-out'
	};`;

	$: if (user?.id && user.id !== lastUserId) {
		lastUserId = user.id;
		currentPhotoIndex = 0;
		resetPosition();
	}

	function handlePointerDown(event) {
		if (event.button && event.button !== 0) return;
		activePointerId = event.pointerId;
		isDragging = true;
		startX = event.clientX;
		startY = event.clientY;
		try {
			cardElement?.setPointerCapture?.(event.pointerId);
		} catch (error) {
			console.debug('Pointer capture error (safe to ignore):', error);
		}
		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp);
		window.addEventListener('pointercancel', handlePointerUp);
	}

	function handlePointerMove(event) {
		if (!isDragging || event.pointerId !== activePointerId) return;
		currentX = event.clientX - startX;
		currentY = event.clientY - startY;
		rotation = currentX * ROTATION_FACTOR;
		const distance = Math.abs(currentX);
		opacity = Math.max(0.3, 1 - distance / 300);
	}

	function handlePointerUp(event) {
		if (event.pointerId !== activePointerId) return;
		cleanupPointerListeners();
		handleDragEnd();
	}

	function cleanupPointerListeners() {
		if (activePointerId !== null && cardElement) {
			try {
				cardElement.releasePointerCapture?.(activePointerId);
			} catch (error) {
				// Ignore errors if pointer capture is already released or invalid
				console.debug('Pointer capture release error (safe to ignore):', error);
			}
		}
		activePointerId = null;
		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('pointerup', handlePointerUp);
		window.removeEventListener('pointercancel', handlePointerUp);
	}

	function handleDragEnd() {
		if (!isDragging) return;
		isDragging = false;
		if (Math.abs(currentX) > SWIPE_THRESHOLD) {
			currentX > 0 ? swipeRight() : swipeLeft();
		} else {
			resetPosition();
		}
	}

	function swipeRight() {
		onSwipeRight();
		onLike();
		animateOut('right');
	}

	function swipeLeft() {
		onSwipeLeft();
		onDislike();
		animateOut('left');
	}

	function animateOut(direction) {
		const finalX = direction === 'right' ? 1000 : -1000;
		currentX = finalX;
		opacity = 0;
		rotation = direction === 'right' ? 15 : -15;
		clearTimeout(resetTimer);
		resetTimer = setTimeout(() => resetPosition(), 300);
	}

	function resetPosition() {
		currentX = 0;
		currentY = 0;
		rotation = 0;
		opacity = 1;
	}

	function nextPhoto() {
		if (user?.photos && currentPhotoIndex < user.photos.length - 1) {
			currentPhotoIndex += 1;
		}
	}

	function prevPhoto() {
		if (currentPhotoIndex > 0) currentPhotoIndex -= 1;
	}

	onDestroy(() => {
		cleanupPointerListeners();
		clearTimeout(resetTimer);
	});
</script>

<div class="swipe-card-wrapper w-full max-w-sm mx-auto md:flex md:flex-col md:items-center">
	<div
		bind:this={cardElement}
		class="swipe-card relative w-full cursor-grab active:cursor-grabbing"
		style={cardStyle}
		role="button"
		tabindex="0"
		on:pointerdown={handlePointerDown}
	>
		<div class="card overflow-hidden md:overflow-visible h-[600px] md:h-full bg-card-dark" style="max-height: 100%;">
			<!-- Photo Carousel / Ad area -->
			<div class="relative h-[450px] bg-gray-800">
				{#if isAd}
					<!-- Ad content fills the photo area -->
					<div class="w-full h-full flex items-center justify-center px-4">
						<AdSense slot="1234567890" format="auto" responsive={true} />
					</div>
				{:else if user?.photos && user.photos.length > 0}
					<img
						src={user.photos[currentPhotoIndex]}
						alt="{user?.name}"
						class="w-full h-full object-cover select-none"
						loading="lazy"
						draggable="false"
						style="pointer-events: none; user-select: none; -webkit-user-drag: none;"
					/>
					
					<!-- Photo indicators -->
					{#if user.photos.length > 1}
						<div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-none">
							{#each user.photos as _, i}
								<div
									class="h-1 rounded-full transition-all {i === currentPhotoIndex ? 'w-8 bg-white' : 'w-1 bg-white/50'}"
								></div>
							{/each}
						</div>
						
						<!-- Navigation arrows -->
						{#if currentPhotoIndex > 0}
							<button
								class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white z-10"
								on:click={prevPhoto}
								on:pointerdown|stopPropagation
							>
								←
							</button>
						{/if}
						{#if currentPhotoIndex < user.photos.length - 1}
							<button
								class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white z-10"
								on:click={nextPhoto}
								on:pointerdown|stopPropagation
							>
								→
							</button>
						{/if}
					{/if}
				{:else}
					<div class="w-full h-full bg-gray-700 flex items-center justify-center">
						<span class="text-gray-400">No photo</span>
					</div>
				{/if}
			</div>
			
			<!-- User Info / Ad text -->
			<div class="p-6">
				<div class="flex items-center justify-between mb-2">
					<h2 class="text-2xl font-semibold text-text-light">
						{#if isAd}
							Sponsored
						{:else}
							{user?.name}, {user?.age}
						{/if}
					</h2>
				</div>
				<p class="text-text-light/80 text-base leading-relaxed">
					{#if isAd}
						{user?.bio || 'Upgrade to remove all ads and enjoy an uninterrupted Matcher experience.'}
					{:else}
						{user?.bio || 'No bio available'}
					{/if}
				</p>
			</div>
		</div>
	</div>

	<!-- Action Buttons - Mobile only -->
	<div class="relative flex gap-4 z-20 action-buttons-mobile mt-2 md:hidden">
		<button
			class="btn-circle bg-white hover:bg-gray-100 text-dislike-gray shadow-lg"
			on:click|stopPropagation={(e) => {
				e.stopPropagation();
				e.preventDefault();
				swipeLeft();
			}}
			on:pointerdown|stopPropagation={(e) => {
				e.stopPropagation();
			}}
			aria-label="Dislike"
		>
			<X size={32} class="md:w-8 md:h-8" />
		</button>
		<button
			class="btn-circle bg-match-green hover:bg-green-500 text-white shadow-lg"
			on:click|stopPropagation={(e) => {
				e.stopPropagation();
				e.preventDefault();
				swipeRight();
			}}
			on:pointerdown|stopPropagation={(e) => {
				e.stopPropagation();
			}}
			aria-label="Like"
		>
			<Heart size={32} class="md:w-8 md:h-8" />
		</button>
	</div>
</div>

