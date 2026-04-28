<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { User, MapPin, Loader2, Upload } from 'lucide-svelte';
	
	export let data;
	$: void data;
	
	let age = '';
	let gender = '';
	let bio = '';
	/** @type {File | null} */
	let profilePicture = null;
	/** @type {HTMLInputElement | null} */
	let photoInput = null;
	/** @type {string | null} */
	let profilePicturePreview = null;
	let isLoading = false;
	let uploadProgress = 0;
	let error = '';
	let locationStatus = 'Getting location...';
	/** @type {{ lat: number; lng: number } | null} */
	let location = null;
	
	onMount(async () => {
		// Get user's current location
		await getLocation();
	});
	
	async function getLocation() {
		if (!navigator.geolocation) {
			locationStatus = 'Geolocation not supported by your browser';
			return;
		}
		
		navigator.geolocation.getCurrentPosition(
			(position) => {
				location = {
					lat: position.coords.latitude,
					lng: position.coords.longitude
				};
				locationStatus = 'Location found ✓';
			},
			(error) => {
				console.error('Geolocation error:', error);
				locationStatus = 'Location access denied. Please enable location services.';
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0
			}
		);
	}

	/**
	 * Some mobile browsers may not set MIME type reliably.
	 * @param {File} file
	 */
	function isLikelyImage(file) {
		if (file.type?.startsWith('image/')) return true;
		return /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(file.name);
	}
	
	/**
	 * @param {Event} event
	 */
	function handleFileSelect(event) {
		const target = /** @type {HTMLInputElement | null} */ (event.currentTarget || event.target);
		if (!target) return;
		const file = target.files?.[0];
		if (!file) return;
		
		if (!isLikelyImage(file)) {
			error = 'Please select an image file';
			return;
		}
		
		if (file.size > 5 * 1024 * 1024) { // 5MB limit
			error = 'Image must be less than 5MB';
			return;
		}
		
		profilePicture = file;
		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result;
			if (typeof result === 'string') {
				profilePicturePreview = result;
			}
		};
		reader.readAsDataURL(file);
		error = '';
	}

	function openPhotoPicker() {
		photoInput?.click();
	}

	/**
	 * Upload photo with progress feedback for the user.
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

				let message = payload.error;
				if (!message && xhr.responseType !== 'json') {
					message = `Upload failed with status ${xhr.status}`;
				}
				if (!message && xhr.status >= 200 && xhr.status < 300) {
					message = 'Photo upload response is missing photoUrl';
				}
				if (!message) {
					message = `Failed to upload photo (status ${xhr.status})`;
				}
				reject(new Error(message));
			};

			xhr.onerror = () => reject(new Error('Network error while uploading photo'));
			xhr.send(formData);
		});
	}
	
	/**
	 * @param {SubmitEvent} event
	 */
	async function handleSubmit(event) {
		event.preventDefault();
		error = '';
		
		if (!age || parseInt(age) < 18 || parseInt(age) > 99) {
			error = 'Please enter a valid age (18-99)';
			return;
		}
		
		if (!gender || (gender !== 'male' && gender !== 'female')) {
			error = 'Please select your gender';
			return;
		}
		
		if (!bio || bio.length > 50) {
			error = 'Bio is required and must be 50 characters or less';
			return;
		}

		// Fallback to input file list if state was not updated for any reason.
		const fallbackFile = photoInput?.files?.[0] ?? null;
		if (!profilePicture && fallbackFile) {
			if (isLikelyImage(fallbackFile) && fallbackFile.size <= 5 * 1024 * 1024) {
				profilePicture = fallbackFile;
			}
		}
		
		if (!profilePicture) {
			error = 'Please upload a profile picture';
			return;
		}
		
		if (!location) {
			error = 'Please allow location access to continue';
			return;
		}
		
		isLoading = true;
		uploadProgress = 0;
		
		try {
			// Upload profile picture with progress feedback
			const photoUrl = await uploadPhotoWithProgress(profilePicture);
			
			// Update user profile
			const updateResponse = await fetch('/api/setup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					age: parseInt(age),
					gender,
					bio,
					photos: [photoUrl],
					location
				})
			});
			
			if (!updateResponse.ok) {
				const errorData = await updateResponse.json().catch(() => ({}));
				throw new Error(errorData.error || 'Failed to update profile');
			}

			const updatePayload = await updateResponse.json().catch(() => ({}));
			if (updatePayload.profileComplete === false) {
				throw new Error('Profile setup is not complete yet. Please check your fields and try again.');
			}
			
			// Redirect immediately after successful setup.
			// Extra network calls here can fail/hang on mobile browsers.
			window.location.href = '/';
		} catch (err) {
			console.error('Setup error:', err);
			error = err instanceof Error ? err.message : 'Failed to complete setup. Please try again.';
		} finally {
			isLoading = false;
			uploadProgress = 0;
		}
	}
</script>

<svelte:head>
	<title>Complete Your Profile - Matcher</title>
</svelte:head>

<div class="h-screen overflow-y-auto bg-bg-dark p-4">
	<div class="w-full max-w-md mx-auto py-4">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-text-light mb-2">Complete Your Profile</h1>
			<p class="text-text-light/60">Tell us about yourself to start matching</p>
		</div>
		
		<div class="card p-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
			<form on:submit={handleSubmit} class="space-y-6">
				{#if error}
					<div class="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
						{error}
					</div>
				{/if}
				
				<!-- Location Status -->
				<div class="flex items-center gap-2 text-sm">
					<MapPin class="text-text-light/60" size={20} />
					<span class="text-text-light/80">{locationStatus}</span>
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
							class="w-full bg-gray-800 text-text-light px-4 py-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
							placeholder="Your age"
						/>
					</div>
				</div>
				
				<!-- Gender -->
				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="gender-input">
						Gender
					</label>
					<select
						id="gender-input"
						bind:value={gender}
						required
						class="w-full bg-gray-800 text-text-light px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse"
					>
						<option value="">Select your gender</option>
						<option value="male">Male</option>
						<option value="female">Female</option>
					</select>
				</div>
				
				<!-- Bio -->
				<div>
					<label class="block text-sm text-text-light/80 mb-2" for="bio-input">
						Bio <span class="text-text-light/60">(max 50 characters)</span>
					</label>
					<textarea
						id="bio-input"
						bind:value={bio}
						maxlength="50"
						required
						rows="3"
						class="w-full bg-gray-800 text-text-light px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-crimson-pulse resize-none"
						placeholder="Tell us about yourself..."
					></textarea>
					<div class="text-right text-xs text-text-light/60 mt-1">
						{bio.length}/50
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
								/>
							</div>
						{/if}
						{#if profilePicture}
							<p class="text-center text-xs text-text-light/60">
								Selected: {profilePicture.name}
							</p>
						{/if}

						<button
							type="button"
							class="w-full btn-rounded bg-gray-800 hover:bg-gray-700 text-text-light border border-gray-600 py-3 flex items-center justify-center gap-2"
							on:click={openPhotoPicker}
						>
							<Upload size={18} />
							Choose Photo
						</button>

						<input
							bind:this={photoInput}
							id="photo-input"
							type="file"
							accept="image/*"
							on:change={handleFileSelect}
							class="sr-only"
						/>
					</div>
				</div>
				
				{#if isLoading}
					<div class="space-y-2">
						<div class="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
							<div
								class="h-full bg-crimson-pulse transition-all duration-150"
								style={`width: ${uploadProgress}%`}
							></div>
						</div>
						<p class="text-xs text-text-light/60 text-center">
							Uploading photo... {uploadProgress}%
						</p>
					</div>
				{/if}

				<Button
					type="submit"
					disabled={isLoading}
					className="w-full border-white text-base font-semibold shadow-lg"
				>
					{#if isLoading}
						<Loader2 class="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 animate-spin text-white" />
					{:else}
						Complete Setup
					{/if}
				</Button>
			</form>
		</div>
	</div>
</div>

