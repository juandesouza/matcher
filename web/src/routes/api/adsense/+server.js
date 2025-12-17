import { json } from '@sveltejs/kit';

/**
 * AdSense Configuration
 * Replace with your actual AdSense publisher ID
 */
const ADSENSE_PUBLISHER_ID = process.env.ADSENSE_PUBLISHER_ID || 'ca-pub-XXXXXXXXXXXX';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	return json({
		publisherId: ADSENSE_PUBLISHER_ID,
		enabled: !!ADSENSE_PUBLISHER_ID
	});
}

