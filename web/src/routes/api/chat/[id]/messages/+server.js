import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/auth/utils.js';
import { db } from '$lib/db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, cookies }) {
	const user = await requireAuth(cookies);
	
	const { id } = params;
	
	// Verify user has access to this chat
	const chat = await db.chat.findFirst({
		where: {
			id: id,
			OR: [
				{ userId1: user.id },
				{ userId2: user.id }
			]
		}
	});
	
	if (!chat) {
		return json({ error: 'Chat not found' }, { status: 404 });
	}
	
	// Fetch messages from database
	const messages = await db.message.findMany({
		where: { chatId: id },
		orderBy: { createdAt: 'asc' },
		include: {
			user: {
				select: {
					id: true,
					name: true
				}
			}
		}
	});
	
	// Format messages
	const formattedMessages = messages.map(msg => ({
		id: msg.id,
		content: msg.content,
		type: msg.type,
		isOwn: msg.userId === user.id,
		timestamp: msg.createdAt.toISOString()
	}));
	
	return json({ messages: formattedMessages });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request, cookies }) {
	const user = await requireAuth(cookies);
	
	const { id } = params;
	const { content, type } = await request.json();
	
	// Verify user has access to this chat
	const chat = await db.chat.findFirst({
		where: {
			id: id,
			OR: [
				{ userId1: user.id },
				{ userId2: user.id }
			]
		}
	});
	
	if (!chat) {
		return json({ error: 'Chat not found' }, { status: 404 });
	}
	
	// Save message to database
	const message = await db.message.create({
		data: {
			chatId: id,
			userId: user.id,
			content,
			type: type || 'text'
		}
	});
	
	// Update chat's updatedAt timestamp
	await db.chat.update({
		where: { id: id },
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
}

