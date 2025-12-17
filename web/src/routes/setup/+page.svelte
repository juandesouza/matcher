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
	/** @type {string | null} */
	let profilePicturePreview = null;
	let isLoading = false;
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
		
		if (!profilePicture) {
			error = 'Please upload a profile picture';
			return;
		}
		
		if (!location) {
			error = 'Please allow location access to continue';
			return;
		}
		
		isLoading = true;
		
		try {
			// Upload profile picture
			const formData = new FormData();
			formData.append('photo', profilePicture);
			
			const uploadResponse = await fetch('/api/upload/photo', {
				method: 'POST',
				body: formData
			});
			
			if (!uploadResponse.ok) {
				const errorData = await uploadResponse.json();
				throw new Error(errorData.error || 'Failed to upload photo');
			}
			
			const { photoUrl } = await uploadResponse.json();
			
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
				const errorData = await updateResponse.json();
				throw new Error(errorData.error || 'Failed to update profile');
			}
			
			// Invalidate layout data and redirect to home
			await fetch('/api/auth/check'); // Refresh session data
			window.location.href = '/'; // Force full page reload to refresh layout data
		} catch (err) {
			console.error('Setup error:', err);
			error = err instanceof Error ? err.message : 'Failed to complete setup. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Complete Your Profile - Matcher</title>
</svelte:head>

<div class="min-h-screen bg-bg-dark flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-text-light mb-2">Complete Your Profile</h1>
			<p class="text-text-light/60">Tell us about yourself to start matching</p>
		</div>
		
		<div class="card p-6">
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
						
						<label
							for="photo-input"
							class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-crimson-pulse transition-colors"
						>
							<div class="flex flex-col items-center justify-center pt-5 pb-6">
								<Upload class="text-text-light/60 mb-2" size={24} />
								<p class="text-sm text-text-light/80">
									<span class="font-semibold">Click to upload</span> or drag and drop
								</p>
								<p class="text-xs text-text-light/60 mt-1">PNG, JPG up to 5MB</p>
							</div>
							<input
								id="photo-input"
								type="file"
								accept="image/*"
								on:change={handleFileSelect}
								class="hidden"
							/>
						</label>
					</div>
				</div>
				
				<Button type="submit" disabled={isLoading || !location} class="w-full border-white">
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

