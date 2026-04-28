import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

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
	
	try {
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
			return json({ error: 'No file provided' }, { status: 400 });
		}
		
		// Validate file type (mobile browsers may omit MIME type)
		// @ts-ignore - validated by isFileLike guard above
		if (!isLikelyImage(file)) {
			return json({ error: 'File must be an image' }, { status: 400 });
		}
		
		// Validate file size (5MB limit)
		// @ts-ignore - validated by isFileLike guard above
		if (file.size > 5 * 1024 * 1024) {
			return json({ error: 'File must be less than 5MB' }, { status: 400 });
		}
		
		// Create uploads directory if it doesn't exist
		const uploadsDir = join(process.cwd(), 'static', 'uploads', 'photos');
		await mkdir(uploadsDir, { recursive: true });
		
		// Generate unique filename
		// @ts-ignore - validated by isFileLike guard above
		const fileExt = file.name.split('.').pop();
		const filename = `${randomUUID()}.${fileExt}`;
		const filepath = join(uploadsDir, filename);
		
		// Save file
		// @ts-ignore - validated by isFileLike guard above
		const arrayBuffer = await file.arrayBuffer();
		await writeFile(filepath, Buffer.from(arrayBuffer));
		
		// Return public URL
		const photoUrl = `/uploads/photos/${filename}`;
		
		return json({ photoUrl });
	} catch (error) {
		console.error('Upload error:', error);
		if (error?.code === 'EROFS' || error?.code === 'EACCES') {
			return json({ error: 'Server cannot write uploaded files right now' }, { status: 500 });
		}
		if (error?.status === 401) {
			return json({ error: 'Session expired. Please log in again.' }, { status: 401 });
		}
		return json({ error: 'Failed to upload photo' }, { status: 500 });
	}
}

