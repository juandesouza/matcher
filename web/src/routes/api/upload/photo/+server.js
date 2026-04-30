import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';

/**
 * @param {File} file
 */
function isLikelyImage(file) {
	if (file.type?.startsWith('image/')) return true;
	return /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(file.name);
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	const user = await requireAuth(cookies, true);
	let stage = 'init';
	
	try {
		stage = 'formdata';
		const formData = await request.formData();
		const file = formData.get('photo');
		
		const isFileLike =
			file &&
			typeof file === 'object' &&
			'name' in file &&
			'size' in file &&
			'type' in file &&
			'arrayBuffer' in file;

		if (!isFileLike) {
			return json({ error: 'No file provided', stage }, { status: 400 });
		}
		
		// Validate file type (mobile browsers may omit MIME type)
		// @ts-ignore - validated by isFileLike guard above
		if (!isLikelyImage(file)) {
			return json({ error: 'File must be an image', stage, fileType: file.type, fileName: file.name }, { status: 400 });
		}
		
		// Validate file size (5MB limit)
		// @ts-ignore - validated by isFileLike guard above
		if (file.size > 5 * 1024 * 1024) {
			return json({ error: 'File must be less than 5MB', stage, fileSize: file.size }, { status: 400 });
		}
		
		stage = 'encode';
		// Encode and return as data URL (avoids broken links on ephemeral storage)
		// @ts-ignore - validated by isFileLike guard above
		const arrayBuffer = await file.arrayBuffer();
		const bytes = Buffer.from(arrayBuffer);
		// @ts-ignore - validated by isFileLike guard above
		const mimeType = file.type?.startsWith('image/') ? file.type : 'image/jpeg';
		const photoUrl = `data:${mimeType};base64,${bytes.toString('base64')}`;
		
		return json({ photoUrl });
	} catch (error) {
		console.error('Upload error:', {
			stage,
			message: error?.message,
			code: error?.code,
			name: error?.name
		});
		if (error?.status === 401) {
			return json({ error: 'Session expired. Please log in again.', stage }, { status: 401 });
		}
		return json({
			error: 'Failed to upload photo',
			stage,
			code: error?.code || null,
			message: error?.message || null
		}, { status: 500 });
	}
}

