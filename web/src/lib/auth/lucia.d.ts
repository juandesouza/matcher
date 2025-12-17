import type { Lucia } from 'lucia';

declare module 'lucia' {
	interface Register {
		Lucia: Lucia;
		DatabaseUserAttributes: {
			email: string;
			name: string;
			age: number;
			gender?: string | null;
			bio?: string | null;
			photos: string[];
			location?: { lat: number; lng: number } | null;
			ageRange: { min: number; max: number };
			distanceRange: number;
			theme: string;
			isSubscribed: boolean;
			stripeCustomerId?: string | null;
			provider?: string | null;
			providerId?: string | null;
			createdAt: Date;
			updatedAt: Date;
		};
	}
}

