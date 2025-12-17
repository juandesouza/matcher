import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const clientId = env.GOOGLE_CLIENT_ID;
	
	return json({
		clientId: clientId || null
	});
}

