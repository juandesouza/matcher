import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find project root (web/) - go up from web/src/routes/api/admin/seed/+server.js
// In development: web/src/routes/api/admin/seed/
// In production build: web/build/server/entries/pages/api/admin/seed/+server.js
// Use process.cwd() as fallback, which should be web/ in both cases
let projectRoot = process.cwd();
if (__dirname.includes('src/routes')) {
	// Development mode
	projectRoot = join(__dirname, '../../../../../../');
} else if (__dirname.includes('build')) {
	// Production build
	projectRoot = join(__dirname, '../../../..');
}

const seedScriptPath = join(projectRoot, 'prisma/seed.js');

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		// Simple security: Check for a secret token in the request
		// In production, use a proper API key or admin authentication
		const { secret } = await request.json();
		
		// Use a secret from environment variable or a hardcoded one for this one-time operation
		const expectedSecret = process.env.SEED_SECRET || 'temporary-seed-secret-change-in-production';
		
		if (secret !== expectedSecret) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		console.log('[Admin Seed] Starting database seed...');
		console.log('[Admin Seed] Working directory:', projectRoot);
		
		// Prisma client should already be generated during build
		// Just run the seed script directly
		console.log('[Admin Seed] Running seed script...');
		const seedScriptPath = join(projectRoot, 'prisma/seed.js');
		const { stdout, stderr } = await execAsync(`node ${seedScriptPath}`, {
			cwd: projectRoot,
			env: {
				...process.env,
				// Ensure DATABASE_URL is set from environment
				DATABASE_URL: process.env.DATABASE_URL
			},
			timeout: 60000 // 1 minute timeout (only 4 users now)
		});

		console.log('[Admin Seed] Seed output:', stdout);
		if (stderr) {
			console.error('[Admin Seed] Seed errors:', stderr);
		}

		return json({ 
			success: true, 
			message: 'Seed script executed successfully',
			output: stdout,
			errors: stderr || null
		});

	} catch (error) {
		console.error('[Admin Seed] Error:', error);
		return json({ 
			error: 'Seed script failed', 
			message: error.message,
			output: error.stdout || null,
			errors: error.stderr || null
		}, { status: 500 });
	}
}


