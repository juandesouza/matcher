<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { User, Upload, Loader2 } from 'lucide-svelte';
	
	export let data;
	$: void data;
	
	let name = '';
	let age = '';
	/** @type {File | null} */
	let profilePicture = null;
	let selectedFileName = '';
	/** @type {string | null} */
	let profilePicturePreview = null;
	let currentSavedPhoto = null;
	let imageLoadFailed = false;
	let isLoading = false;
	let uploadProgress = 0;
	let error = '';
	let success = '';
	
	onMount(() => {
		if (data.user) {
			name = data.user.name || '';
			age = data.user.age?.toString() || '';
			if (data.user.photos && data.user.photos[0]) {
				currentSavedPhoto = data.user.photos[0];
				profilePicturePreview = currentSavedPhoto;
			}
		}
	});
	
	/**
	 * @param {Event} event
	 */
	function handleFileSelect(event) {
		const target = event.target;
		if (!(target instanceof HTMLInputElement)) return;
		const file = target.files?.[0];
		if (!file) return;
		
		if (!file.type.startsWith('image/')) {
			error = 'Please select an image file';
			return;
		}
		
		if (file.size > 5 * 1024 * 1024) { // 5MB limit
			error = 'Image must be less than 5MB';
			return;
		}
		
		profilePicture = file;
		selectedFileName = file.name;
		imageLoadFailed = false;
		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result;
			if (typeof result === 'string') {
				profilePicturePreview = result;
			}
		};
		reader.readAsDataURL(file);
		error = '';
		success = '';
	}

	/**
	 * @param {File} file
	 * @returns {Promise<string>}
	 */
	function uploadPhotoWithProgress(file) {
		return new Promise((resolve, reject) => {
			const formData = new FormData();
			formData.append('photo', file);

			const xhr = new XMLHttpRequest();
			xhr.open('POST', '/api/upload/photo');
			xhr.responseType = 'json';

			xhr.upload.onprogress = (e) => {
				if (!e.lengthComputable) return;
				uploadProgress = Math.round((e.loaded / e.total) * 100);
			};

			xhr.onload = () => {
				const payload = xhr.response || {};
				if (xhr.status >= 200 && xhr.status < 300 && payload.photoUrl) {
					resolve(payload.photoUrl);
					return;
				}
				reject(new Error(payload.error || `Failed to upload photo (status ${xhr.status})`));
			};

			xhr.onerror = () => reject(new Error('Network error while uploading photo'));
			xhr.send(formData);
		});
	}
	
	async function handleSaveProfile() {
		if (!name || name.trim().length === 0) {
			error = 'Name is required';
			return;
		}
		
		if (!age || parseInt(age) < 18 || parseInt(age) > 99) {
			error = 'Age must be between 18 and 99';
			return;
		}

		isLoading = true;
		uploadProgress = 0;
		error = '';
		success = '';

		try {
			let photoUrl = currentSavedPhoto;

			// Upload new photo only when user explicitly saves
			if (profilePicture) {
				photoUrl = await uploadPhotoWithProgress(profilePicture);
			}

			const updateResponse = await fetch('/api/profile', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					age: parseInt(age),
					photos: photoUrl ? [photoUrl] : data.user?.photos || []
				})
			});

			if (!updateResponse.ok) {
				const errorData = await updateResponse.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to update profile');
			}

			currentSavedPhoto = photoUrl;
			profilePicture = null;
			selectedFileName = '';
			imageLoadFailed = false;
			profilePicturePreview = photoUrl;
			success = 'Profile saved successfully.';
		} catch (err) {
			console.error('Profile save error:', err);
			error = err instanceof Error ? err.message : 'Failed to save profile. Please try again.';
		} finally {
			isLoading = false;
			uploadProgress = 0;
		}
	}
</script>

<svelte:head>
	<title>Edit Profile - Matcher</title>
</svelte:head>

<div class="min-h-screen bg-bg py-8 px-4 md:py-4 md:pb-20">
	<div class="max-w-2xl mx-auto">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-text-light mb-2">Edit Profile</h1>
			<p class="text-text-light/60">Update your profile information</p>
		</div>
		
		<div class="card p-6">
			<form on:submit|preventDefault={handleSaveProfile} class="space-y-6">
				{#if error}
					<div class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
						{error}
					</div>
				{/if}
				{#if success}
					<div class="bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg text-sm">
						{success}
					</div>
				{/if}
				
				<!-- Name -->
				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="name-input">
						Name
					</label>
					<div class="relative">
						<User class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light/60" size={20} />
						<input
							id="name-input"
							type="text"
							bind:value={name}
							required
							class="w-full bg-card text-text px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
							placeholder="Your name"
						/>
					</div>
				</div>
				
				<!-- Age -->
				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="age-input">
						Age
					</label>
					<div class="relative">
						<User class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light/60" size={20} />
						<input
							id="age-input"
							type="number"
							bind:value={age}
							min="18"
							max="99"
							required
							class="w-full bg-card text-text px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
							placeholder="Your age"
						/>
					</div>
				</div>
				
				<!-- Profile Picture -->
				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="photo-input">
						Profile Picture
					</label>
					<div class="space-y-4">
						{#if profilePicturePreview}
							<div class="relative w-32 h-32 mx-auto">
								<img
									src={profilePicturePreview}
									alt="Profile preview"
									class="w-full h-full object-cover rounded-full border-2 border-crimson-pulse"
									on:error={() => { imageLoadFailed = true; }}
								/>
							</div>
						{/if}
						{#if imageLoadFailed}
							<p class="text-center text-xs text-yellow-400">
								Could not load current image. Select a new photo and click Save Changes.
							</p>
						{/if}
						{#if selectedFileName}
							<p class="text-center text-xs text-text-light/70">
								Selected file: {selectedFileName}
							</p>
						{/if}
						
						<input
							id="photo-input"
							type="file"
							accept="image/*"
							on:change={handleFileSelect}
							class="w-full text-sm text-text-light file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-crimson-pulse file:text-white bg-gray-800 rounded-lg p-2"
						/>
					</div>
				</div>
				{#if isLoading && selectedFileName}
					<div class="space-y-2">
						<div class="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
							<div
								class="h-full bg-crimson-pulse transition-all duration-150"
								style={`width: ${uploadProgress}%`}
							></div>
						</div>
						<p class="text-xs text-text-light/60 text-center">
							Uploading image... {uploadProgress}%
						</p>
					</div>
				{/if}
				
				<div class="flex gap-4">
					<button
						type="button"
						class="w-full btn-rounded bg-transparent border border-gray-400 text-text hover:bg-card"
						on:click={() => goto('/settings')}
					>
						Back to Settings
					</button>
					<button
						type="submit"
						class="w-full btn-rounded bg-gray-800 hover:bg-gray-700 text-white border-2 border-white disabled:opacity-50"
						disabled={isLoading}
					>
						Save Changes
					</button>
				</div>
				
				{#if isLoading}
					<div class="text-center text-text-light/60 text-sm flex items-center justify-center gap-2">
						<Loader2 class="w-4 h-4 animate-spin" />
						Saving...
					</div>
				{/if}
			</form>
		</div>
	</div>
</div>

