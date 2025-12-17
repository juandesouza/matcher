<script>
	import { onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { Send, Image as ImageIcon } from 'lucide-svelte';
	import AdSense from '$lib/components/AdSense.svelte';
	
	export let data;
	$: void data;
	
	/** @type {Array<{ id: string; content: string; type: string; isOwn: boolean; timestamp: string }>} */
	let messages = [];
	let newMessage = '';
	let isLoading = true; // Only for initial load
	let isPolling = false; // For background polling (silent)
	let isSubscribed = false;
	/** @type {(() => void) | null} */
	let cleanupListener = null;
	/** @type {string | null} */
	let lastChatId = null;
	/** @type {string | null} */
	let chatId = null;
	let fileError = '';

	// React to route param changes and initialize chat
	$: {
		const id = $page?.params?.id;
		if (id && id !== lastChatId && data && 'chatId' in data && data.chatId) {
			lastChatId = id;
			chatId = data.chatId;
			initializeChat(data.chatId);
		}
	}

	/**
	 * @param {string} chatId
	 */
	async function initializeChat(chatId) {
		await loadMessages(chatId);
		startMessageListener(chatId);
		// Fetch subscription status
		try {
			const response = await fetch('/api/settings');
			if (response.ok) {
				const settingsData = await response.json();
				isSubscribed = settingsData.isSubscribed || false;
			}
		} catch (error) {
			console.error('Failed to fetch settings:', error);
		}
	}

	/**
	 * @param {string} chatId
	 */
	function startMessageListener(chatId) {
		if (cleanupListener) {
			cleanupListener();
		}
		cleanupListener = setupMessageListener(chatId);
	}

	onDestroy(() => {
		if (cleanupListener) cleanupListener();
	});
	
	/**
	 * @param {string} chatId
	 * @param {boolean} silent
	 */
	async function loadMessages(chatId, silent = false) {
		try {
			if (!silent) {
				isLoading = true;
			} else {
				isPolling = true;
			}
			const response = await fetch(`/api/chat/${chatId}/messages`);
			if (response.ok) {
				const messagesData = await response.json();
				messages = messagesData.messages || [];
			}
		} catch (error) {
			console.error('Failed to load messages:', error);
		} finally {
			if (!silent) {
				isLoading = false;
			} else {
				isPolling = false;
			}
		}
	}
	
	/**
	 * @param {string} chatId
	 * @returns {() => void}
	 */
	function setupMessageListener(chatId) {
		// Set up real-time message listener (WebSocket or polling)
		// For now, use polling - silent background updates
		const interval = setInterval(async () => {
			if (chatId) {
				await loadMessages(chatId, true); // true = silent polling
			}
		}, 5000);
		
		return () => clearInterval(interval);
	}
	
	async function sendMessage() {
		if (!newMessage.trim() || !chatId) return;
		
		try {
			const response = await fetch(`/api/chat/${chatId}/messages`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					content: newMessage,
					type: 'text'
				})
			});
			
			if (response.ok) {
				newMessage = '';
				await loadMessages(chatId);
			}
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	}
	
	/**
	 * @param {KeyboardEvent} e
	 */
	function handleKeyPress(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}
	
	async function handleFileUpload() {
		// Image: file picker - auto-send on selection
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		
		input.onchange = async (e) => {
			const target = e.target;
			if (!(target instanceof HTMLInputElement)) return;
			const file = target.files?.[0];
			if (!file) return;
			
			// Check file size (1MB limit)
			const maxSize = 1 * 1024 * 1024; // 1MB in bytes
			if (file.size > maxSize) {
				fileError = 'File must be smaller than 1MB';
				setTimeout(() => {
					fileError = '';
				}, 5000);
				return;
			}
			
			fileError = '';
			// Auto-send image immediately
			await sendMediaMessage(file, 'image');
		};
		
		input.click();
	}
	
	/**
	 * @param {File} file
	 * @param {'image'} type
	 */
	async function sendMediaMessage(file, type) {
		if (!chatId) return;
		
		const formData = new FormData();
		formData.append('file', file);
		formData.append('type', type);
		
		try {
			const response = await fetch(`/api/chat/${chatId}/upload`, {
				method: 'POST',
				body: formData
			});
			
			if (response.ok) {
				await loadMessages(chatId);
			} else {
				console.error('Failed to upload media:', response.status, response.statusText);
			}
		} catch (error) {
			console.error('Failed to upload media:', error);
		}
	}
</script>

<svelte:head>
	<title>Chat - Matcher</title>
</svelte:head>

<div class="flex flex-col h-[calc(100vh-4.75rem)] md:h-[calc(100vh-4.75rem)] md:relative bg-bg">
	<!-- Chat Header -->
	{#if data && 'otherUser' in data && data.otherUser}
		<div class="border-b border-gray-300 dark:border-gray-700 p-4 bg-card flex-shrink-0 z-10">
			<div class="flex items-center gap-3">
				{#if data.otherUser.photos && data.otherUser.photos[0]}
					<img
						src={data.otherUser.photos[0]}
						alt={data.otherUser.name}
						class="w-10 h-10 rounded-full object-cover"
					/>
				{/if}
				<div>
					<h2 class="text-text font-semibold">{data.otherUser.name}</h2>
					<p class="text-text/60 text-sm">{data.otherUser.age} years old</p>
				</div>
			</div>
		</div>
	{/if}
	
	<!-- Messages Area -->
	<div class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 pb-20 md:pb-20">
		{#if isLoading}
			<div class="flex items-center justify-center h-full">
				<div class="text-text">Loading messages...</div>
			</div>
		{:else if messages.length === 0}
			<div class="flex items-center justify-center h-full">
				<p class="text-text/60">No messages yet. Start the conversation!</p>
			</div>
		{:else}
			{#each messages as message}
				<div
					class="flex {message.isOwn ? 'justify-end' : 'justify-start'}"
				>
					<div
						class="max-w-xs md:max-w-md px-4 py-2 rounded-2xl {message.isOwn ? 'bg-crimson-pulse text-white' : 'bg-gray-200 dark:bg-card-dark text-gray-800 dark:text-text-light'}"
					>
						{#if message.type === 'text'}
							<p>{message.content}</p>
						{:else if message.type === 'image'}
							<button
								type="button"
								class="max-w-full rounded-lg cursor-pointer p-0 border-0 bg-transparent"
								on:click={() => {
									// Open in larger view
									const modal = document.createElement('div');
									modal.className = 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4';
									modal.onclick = () => modal.remove();
									const img = document.createElement('img');
									img.src = message.content;
									img.className = 'max-w-full max-h-full object-contain';
									modal.appendChild(img);
									document.body.appendChild(modal);
								}}
							>
								<img
									src={message.content}
									alt="Shared image"
									class="max-w-full rounded-lg"
								/>
							</button>
						{:else if message.type === 'video'}
							<video src={message.content} controls class="max-w-full rounded-lg">
								<track kind="captions" />
							</video>
						{:else if message.type === 'audio'}
							<audio src={message.content} controls class="w-full"></audio>
						{/if}
						<p class="text-xs opacity-70 mt-1">
							{new Date(message.timestamp).toLocaleTimeString()}
						</p>
					</div>
				</div>
			{/each}
		{/if}
	</div>
	
	<!-- Persistent Ad Banner at bottom of chat for non-subscribed users -->
	{#if !isSubscribed}
		<div class="border-t border-gray-300 dark:border-gray-700 bg-card px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between flex-shrink-0">
			<div class="w-full md:w-auto md:flex-1 md:mr-4">
				<AdSense slot="1234567891" format="auto" responsive={true} />
			</div>
			<button
				class="mt-2 md:mt-0 text-crimson-pulse underline text-sm md:text-base"
				on:click={() => (window.location.href = '/subscribe')}
			>
				Subscribe for removing ads
			</button>
		</div>
	{/if}
	
	<!-- Error Message -->
	{#if fileError}
		<div class="border-t border-red-500 p-3 bg-red-500/20 flex-shrink-0">
			<p class="text-red-200 text-sm text-center">{fileError}</p>
		</div>
	{/if}
	
	<!-- Input Area -->
	<div class="border-t border-gray-300 dark:border-gray-700 p-4 bg-card flex-shrink-0 mt-auto z-50">
		<div class="flex items-center gap-2">
			<!-- Image Button -->
			<button
				class="btn-circle bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-text"
				on:click={handleFileUpload}
				aria-label="Send image"
			>
				<ImageIcon size={20} />
			</button>
			
			<!-- Text Input -->
			<input
				type="text"
				bind:value={newMessage}
				on:keypress={handleKeyPress}
				placeholder="Type a message..."
				class="flex-1 bg-card text-text px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
			/>
			
			<!-- Send Button -->
			<button
				class="md:btn-circle bg-transparent md:bg-crimson-pulse text-crimson-pulse md:text-white md:w-14 md:h-14 w-auto h-auto p-0 md:p-0 flex items-center justify-center rounded-full"
				on:click={sendMessage}
				disabled={!newMessage.trim()}
				aria-label="Send message"
			>
				<Send size={20} />
			</button>
		</div>
	</div>
</div>

