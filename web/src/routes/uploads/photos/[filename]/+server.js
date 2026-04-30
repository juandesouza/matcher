import { error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';

const MIME_BY_EXT = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp',
	gif: 'image/gif',
	heic: 'image/heic',
	heif: 'image/heif'
};

/**
 * @param {string} filename
 */
function getMimeType(filename) {
	const ext = filename.split('.').pop()?.toLowerCase() || '';
	return MIME_BY_EXT[ext] || 'application/octet-stream';
}

/**
 * @param {string} filename
 */
function candidatePaths(filename) {
	const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '');
	return [
		join(process.cwd(), 'build', 'client', 'uploads', 'photos', safeName),
		join(process.cwd(), 'static', 'uploads', 'photos', safeName),
		join('/tmp', 'uploads', 'photos', safeName)
	];
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
	const { filename } = params;
	const paths = candidatePaths(filename);

	for (const p of paths) {
		try {
			const file = await readFile(p);
			return new Response(file, {
				headers: {
					'Content-Type': getMimeType(filename),
					'Cache-Control': 'public, max-age=86400'
				}
			});
		} catch {
			// try next path
		}
	}

	throw error(404, 'Image not found');
}

