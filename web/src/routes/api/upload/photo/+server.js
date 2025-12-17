import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, cookies }) {
	const user = await requireAuth(cookies);
	
	try {
		const formData = await request.formData();
		const file = formData.get('photo');
		
		if (!file || !(file instanceof File)) {
			return json({ error: 'No file provided' }, { status: 400 });
		}
		
		// Validate file type
		if (!file.type.startsWith('image/')) {
			return json({ error: 'File must be an image' }, { status: 400 });
		}
		
		// Validate file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			return json({ error: 'File must be less than 5MB' }, { status: 400 });
		}
		
		// Create uploads directory if it doesn't exist
		const uploadsDir = join(process.cwd(), 'static', 'uploads', 'photos');
		await mkdir(uploadsDir, { recursive: true });
		
		// Generate unique filename
		const fileExt = file.name.split('.').pop();
		const filename = `${randomUUID()}.${fileExt}`;
		const filepath = join(uploadsDir, filename);
		
		// Save file
		const arrayBuffer = await file.arrayBuffer();
		await writeFile(filepath, Buffer.from(arrayBuffer));
		
		// Return public URL
		const photoUrl = `/uploads/photos/${filename}`;
		
		return json({ photoUrl });
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: 'Failed to upload photo' }, { status: 500 });
	}
}

