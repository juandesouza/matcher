import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { writeFile, mkdir, access } from 'fs/promises';
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
		
		stage = 'mkdir';
		// In production adapter-node serves static assets from build/client.
		// In local dev, static assets live under static/.
		const buildClientDir = join(process.cwd(), 'build', 'client');
		let uploadsDir = join(buildClientDir, 'uploads', 'photos');
		try {
			await access(buildClientDir);
		} catch {
			uploadsDir = join(process.cwd(), 'static', 'uploads', 'photos');
		}
		await mkdir(uploadsDir, { recursive: true });
		
		stage = 'write';
		// Generate unique filename
		// @ts-ignore - validated by isFileLike guard above
		const fileExt = file.name.split('.').pop();
		const filename = `${randomUUID()}.${fileExt}`;
		const filepath = join(uploadsDir, filename);
		
		// Save file
		// @ts-ignore - validated by isFileLike guard above
		const arrayBuffer = await file.arrayBuffer();
		await writeFile(filepath, Buffer.from(arrayBuffer));
		
		// Return app-served URL (works in dev/prod regardless of static adapter behavior)
		const photoUrl = `/uploads/photos/${filename}`;
		
		return json({ photoUrl });
	} catch (error) {
		console.error('Upload error:', {
			stage,
			message: error?.message,
			code: error?.code,
			name: error?.name
		});
		if (error?.code === 'EROFS' || error?.code === 'EACCES') {
			return json({
				error: 'Server cannot write uploaded files right now',
				stage,
				code: error?.code
			}, { status: 500 });
		}
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

