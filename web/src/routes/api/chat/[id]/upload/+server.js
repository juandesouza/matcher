import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request, cookies }) {
	const user = await requireAuth(cookies);
	
	const { id: chatId } = params;
	
	// Verify user has access to this chat
	const chat = await db.chat.findFirst({
		where: {
			id: chatId,
			OR: [
				{ userId1: user.id },
				{ userId2: user.id }
			]
		}
	});
	
	if (!chat) {
		return json({ error: 'Chat not found' }, { status: 404 });
	}
	
	try {
		const formData = await request.formData();
		const file = formData.get('file');
		const type = formData.get('type') || 'image';
		
		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}
		
		// Handle both File objects (web) and FormData entries (React Native)
		let fileName = 'image.jpg';
		let fileBuffer;
		
		if (file instanceof File) {
			// Web FormData
			fileName = file.name || fileName;
			const arrayBuffer = await file.arrayBuffer();
			fileBuffer = Buffer.from(arrayBuffer);
		} else {
			// React Native FormData - file is a Blob-like object
			const arrayBuffer = await file.arrayBuffer();
			fileBuffer = Buffer.from(arrayBuffer);
			// Try to get filename from formData if available
			const nameEntry = formData.get('name');
			if (nameEntry && typeof nameEntry === 'string') {
				fileName = nameEntry;
			}
		}
		
		// Save file to local storage (for now)
		// In production, use cloud storage (S3, Cloudinary, etc.)
		const uploadsDir = join(process.cwd(), 'static', 'uploads', 'chat');
		const finalFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${fileName}`;
		const filePath = join(uploadsDir, finalFileName);
		
		// Ensure directory exists
		const { mkdir } = await import('fs/promises');
		await mkdir(uploadsDir, { recursive: true });
		
		// Write file
		await writeFile(filePath, fileBuffer);
		
		// Create URL for the file
		const fileUrl = `/uploads/chat/${finalFileName}`;
		
		// Save message to database
		const message = await db.message.create({
			data: {
				chatId: chatId,
				userId: user.id,
				content: fileUrl,
				type: type
			}
		});
		
		// Update chat's updatedAt timestamp
		await db.chat.update({
			where: { id: chatId },
			data: { updatedAt: new Date() }
		});
		
		return json({
			success: true,
			message: {
				id: message.id,
				content: message.content,
				type: message.type,
				isOwn: true,
				timestamp: message.createdAt.toISOString()
			}
		});
	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: 'Failed to upload file' }, { status: 500 });
	}
}

